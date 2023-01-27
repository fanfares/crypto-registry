import { Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import _ from 'lodash';
import { JoinMessageData } from '../types/join-message-data';
import {
  MessageDto,
  MessageType,
  Message,
  Node,
  NodeDto,
  CreateSubmissionDto,
  VerificationRequestDto
} from '@bcr/types';
import { DbService } from '../db/db.service';
import { SubmissionService } from '../submission';
import { EventGateway } from './event.gateway';
import { MessageSenderService } from './message-sender.service';
import { VerificationService } from '../verification';

@Injectable()
export class MessageReceiverService {

  constructor(
    public apiConfigService: ApiConfigService,
    private logger: Logger,
    private dbService: DbService,
    private submissionService: SubmissionService,
    private eventGateway: EventGateway,
    private messageSenderService: MessageSenderService,
    private verificationService: VerificationService
  ) {
  }

  async getNodeDtos(): Promise<NodeDto[]> {
    return (await this.dbService.nodes.find({})).map(node => ({
      ...node,
      isLocal: node.address === this.apiConfigService.nodeAddress
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
    await this.messageSenderService.sendBroadcastMessage(MessageType.nodeJoined, JSON.stringify(joinMessageData));
    const nodeList: Node[] = (await this.dbService.nodes.find({
      address: { $ne: joinMessageData.address },
      unresponsive: false
    })).map(node => ({
      name: node.name,
      address: node.address,
      unresponsive: false
    }));
    await this.messageSenderService.sendDirectMessage(joinMessageData.address, MessageType.nodeList, JSON.stringify(nodeList));
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
      case MessageType.verify:
        const verificationRequestDto: VerificationRequestDto = JSON.parse(message.data);
        await this.verificationService.verify(verificationRequestDto, true);
        break;
      default:
      // do nothing
    }
  }
}