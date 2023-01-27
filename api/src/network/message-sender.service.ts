import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { MessageDto, MessageType, Message, Node, NodeDto, CreateSubmissionDto } from '@bcr/types';
import { DbService } from '../db/db.service';
import { EventGateway } from './event.gateway';
import { MessageTransportService } from './message-transport.service';

@Injectable()
export class MessageSenderService {

  constructor(
    public apiConfigService: ApiConfigService,
    private messageTransport: MessageTransportService,
    private logger: Logger,
    private dbService: DbService,
    private eventGateway: EventGateway
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

  async sendDirectMessage(
    destinationAddress: string,
    type: MessageType,
    data?: string
  ) {
    const message = Message.createMessage(type, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress, data);
    await this.dbService.messages.insert(message);
    this.eventGateway.emitMessages(await this.getMessageDtos());
    await this.messageTransport.sendMessage(destinationAddress, message);
  }

  async broadcastSubmission(createSubmission: CreateSubmissionDto) {
    await this.sendBroadcastMessage(MessageType.submission, JSON.stringify(createSubmission));
  }

  async sendBroadcastMessage(
    type: MessageType,
    data?: string
  ) {
    const message = Message.createMessage(type, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress, data);
    this.logger.debug('Broadcast Message', message);
    await this.dbService.messages.insert(message);
    this.eventGateway.emitMessages(await this.getMessageDtos());
    const unresponsiveNodeIds: string[] = [];

    const nodes = await this.dbService.nodes.find({});
    if (nodes.length === 0) {
      throw new BadRequestException('Cannot broadcast since Network has zero nodes');
    }

    nodes
      .filter(node => !message.recipientAddresses.includes(node.address))
      .filter(node => node.address !== message.senderAddress)
      .forEach(node => {
        try {
          this.messageTransport.sendMessage(node.address, message);
        } catch (err) {
          console.log(err);
          unresponsiveNodeIds.push(node._id);
        }
      });
    if (unresponsiveNodeIds.length > 0) {
      await this.dbService.nodes.updateMany({
        _id: { $in: unresponsiveNodeIds }
      }, {
        unresponsive: true
      });
    }
  }

  private async addNode(node: Node) {
    const existingNode = await this.dbService.nodes.findOne({ address: node.address });
    if (!existingNode) {
      await this.dbService.nodes.insert(node);
    }
    this.eventGateway.emitNodes(await this.getNodeDtos());
  }

  async requestToJoin() {
    const data = JSON.stringify({
      name: this.apiConfigService.nodeName,
      address: this.apiConfigService.nodeAddress
    });
    await this.sendDirectMessage(this.apiConfigService.networkConnectionAddress, MessageType.joinRequest, data);
  }

  async reset() {
    await this.addNode({
      address: this.apiConfigService.nodeAddress,
      name: this.apiConfigService.nodeName,
      unresponsive: false
    });
    this.eventGateway.emitNodes(await this.getNodeDtos());
    this.eventGateway.emitMessages(await this.getMessageDtos());
  }
}
