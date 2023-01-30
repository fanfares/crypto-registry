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
import { MessageAuthService } from '../authentication/message-auth.service';

@Injectable()
export class MessageReceiverService {

  constructor(
    public apiConfigService: ApiConfigService,
    private logger: Logger,
    private dbService: DbService,
    private submissionService: SubmissionService,
    private eventGateway: EventGateway,
    private messageSenderService: MessageSenderService,
    private verificationService: VerificationService,
    private messageAuthService: MessageAuthService
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
    await this.addNode({ ...joinMessageData, unresponsive: false });
    await this.sendNodeListToNewJoiner(joinMessageData);

    await this.messageSenderService.sendBroadcastMessage(
      MessageType.nodeJoined,
      JSON.stringify(joinMessageData),
      [joinMessageData.address]
    );
  }

  private async sendNodeListToNewJoiner(joinMessageData: JoinMessageData) {
    const nodeList: Node[] = (await this.dbService.nodes.find({
      address: { $ne: joinMessageData.address },
      unresponsive: false
    })).map(node => ({
      name: node.name,
      address: node.address,
      unresponsive: false,
      publicKey: node.publicKey
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
        await this.messageAuthService.verify(message);
        const joinedMessage: JoinMessageData = JSON.parse(message.data);
        await this.addNode({ ...joinedMessage, unresponsive: false });
        break;
      case MessageType.joinRequest:
        const joinMessage: JoinMessageData = JSON.parse(message.data);
        await this.processJoinRequest(joinMessage);
        break;
      case MessageType.nodeList:
        const nodes: Node[] = JSON.parse(message.data);
        for (const node of nodes) {
          await this.addNode(node);
        }
        break;
      case MessageType.submission:
        await this.messageAuthService.verify(message);
        const createSubmissionDto: CreateSubmissionDto = JSON.parse(message.data);
        await this.submissionService.createSubmission(createSubmissionDto);
        break;
      case MessageType.verify:
        await this.messageAuthService.verify(message);
        const verificationRequestDto: VerificationRequestDto = JSON.parse(message.data);
        await this.verificationService.verify(verificationRequestDto, true);
        break;
      default:
      // do nothing
    }
  }
}
