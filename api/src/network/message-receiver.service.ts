import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import _ from 'lodash';
import { MessageTransportService } from './message-transport.service';
import { JoinMessageData } from '../types/join-message-data';
import { MessageDto, MessageType, Message, Node, NodeDto, CreateSubmissionDto } from '@bcr/types';
import { DbService } from '../db/db.service';
import { SubmissionService } from '../submission';
import { EventGateway } from './event.gateway';
import { MessageSenderService } from './message-sender.service';

@Injectable()
export class MessageReceiverService implements OnModuleInit {

  constructor(
    public apiConfigService: ApiConfigService,
    private messageTransportService: MessageTransportService,
    private logger: Logger,
    private dbService: DbService,
    private submissionService: SubmissionService,
    private eventGateway: EventGateway,
    private messageSenderService: MessageSenderService
  ) {
  }

  async getNodeDtos(): Promise<NodeDto[]> {
    return (await this.dbService.nodes.find({})).map(node => ({
      ...node,
      isLocal: node.address === this.apiConfigService.p2pLocalAddress
    }));
  }

  async getMessageDtos(): Promise<MessageDto[]> {
    return (await this.dbService.messages.find({})).map(message => ({
      ...message,
      isSender: message.senderName === this.apiConfigService.nodeName
    }));
  }

  private async processJoinRequest(joinMessageData: JoinMessageData) {
    const existingPeer = await this.dbService.nodes.findOne({ address: joinMessageData.address });
    if (existingPeer) {
      return;
    }
    const node: Node = { ...joinMessageData, unresponsive: false };
    await this.addNode(node);
    const nodeJoinedMessage = Message.createMessage(MessageType.nodeJoined, this.apiConfigService.nodeName, this.apiConfigService.p2pLocalAddress, JSON.stringify(joinMessageData));
    nodeJoinedMessage.recipientAddresses = [joinMessageData.address];
    await this.messageSenderService.sendBroadcastMessage(nodeJoinedMessage);
    const nodeList: Node[] = (await this.dbService.nodes.find({
      address: { $ne: joinMessageData.address },
      unresponsive: false
    })).map(node => ({
      name: node.name,
      address: node.address,
      unresponsive: false
    }));
    const nodeListMessage = Message.createMessage(MessageType.nodeList, this.apiConfigService.nodeName, this.apiConfigService.p2pLocalAddress, JSON.stringify(nodeList));
    nodeListMessage.recipientAddresses = [joinMessageData.address, this.apiConfigService.p2pLocalAddress];
    await this.messageSenderService.sendDirectMessage(joinMessageData.address, nodeListMessage);
  }

  private async addNode(node: Node) {
    const existingNode = await this.dbService.nodes.findOne({ address: node.address });
    if (!existingNode) {
      await this.dbService.nodes.insert(node);
    }
    this.eventGateway.emitNodes(await this.getNodeDtos());
  }

  private async storeReceivedMessage(message: Message) {
    const existingMessage = await this.dbService.messages.findOne({ id: message.id });
    if (existingMessage) {
      const allRecipients = existingMessage.recipientAddresses.concat(message.recipientAddresses);
      existingMessage.recipientAddresses = _.uniq(allRecipients);
      await this.dbService.messages.update(existingMessage._id, {
        recipientAddresses: _.uniq(allRecipients)
      });
    } else {
      await this.dbService.messages.insert(message);
      this.eventGateway.emitMessages(await this.getMessageDtos());
    }
  }

  async receiveMessage(message: Message) {
    this.logger.debug(`Received Message from ${message.senderName}`, { message });
    await this.storeReceivedMessage(message);
    switch (message.type) {
      case MessageType.nodeJoined:
        const joinedMessage: JoinMessageData = JSON.parse(message.data);
        await this.addNode({ ...joinedMessage, unresponsive: false });
        break;
      case MessageType.joinRequest:
        const joinMessage: JoinMessageData = JSON.parse(message.data);
        await this.processJoinRequest(joinMessage);
        break;
      case MessageType.nodeList:
        const receivedAddresses: Node[] = JSON.parse(message.data);
        receivedAddresses.forEach(node => this.addNode(node));
        break;
      case MessageType.submission:
        const createSubmissionDto: CreateSubmissionDto = JSON.parse(message.data);
        await this.submissionService.createSubmission(createSubmissionDto);
        break;
      default:
      // do nothing
    }
  }

  onModuleInit(): any {
    this.messageTransportService.receivedMessage$.subscribe(async message => {
      try {
        await this.receiveMessage(message);
      } catch (err) {
        this.logger.error('Message receipt failure', err);
      }
    });
  }
}
