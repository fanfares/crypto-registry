import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import _ from 'lodash';
import { MessageSenderService } from './message-sender.service';
import { Subject } from 'rxjs';
import { JoinMessageData } from '../types/join-message-data';
import { MessageDto, MessageType, Message, Node, NodeDto } from '@bcr/types';
import { DbService } from '../db/db.service';

@Injectable()
export class P2pService implements OnModuleInit {

  nodes$: Subject<NodeDto[]>;
  messages$: Subject<MessageDto[]>;

  constructor(
    public apiConfigService: ApiConfigService,
    private messageSender: MessageSenderService,
    private logger: Logger,
    private dbService: DbService
  ) {
    this.nodes$ = new Subject<NodeDto[]>();
    this.messages$ = new Subject<MessageDto[]>();
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
      isSender: message.sender === this.apiConfigService.nodeName
    }));
  }

  private async processJoinRequest(joinMessageData: JoinMessageData) {
    const existingPeer = await this.dbService.nodes.findOne({ address: joinMessageData.address });
    if (existingPeer) {
      return;
    }
    const node: Node = { ...joinMessageData, unresponsive: false };
    await this.addNode(node);
    const nodeJoinedMessage = Message.createMessage(MessageType.nodeJoined, this.apiConfigService.nodeName, JSON.stringify(joinMessageData));
    nodeJoinedMessage.recipientAddresses = [joinMessageData.address];
    await this.sendBroadcastMessage(nodeJoinedMessage);
    const nodeList: Node[] = (await this.dbService.nodes.find({
      address: { $ne: joinMessageData.address },
      unresponsive: false
    })).map(node => ({
      name: node.name,
      address: node.address,
      unresponsive: false
    }));
    const nodeListMessage = Message.createMessage(MessageType.nodeList, this.apiConfigService.nodeName, JSON.stringify(nodeList));
    nodeListMessage.recipientAddresses = [joinMessageData.address, this.apiConfigService.p2pLocalAddress];
    await this.sendDirectMessage(joinMessageData.address, nodeListMessage);
  }

  async sendDirectMessage(destinationAddress: string, message: Message) {
    await this.dbService.messages.insert(message);
    this.messages$.next(await this.getMessageDtos());
    await this.messageSender.sendMessage(destinationAddress, message);
  }

  async sendBroadcastMessage(message: Message) {
    this.logger.debug('Broadcast Message', message);
    await this.dbService.messages.insert(message);
    this.messages$.next(await this.getMessageDtos());
    const unresponsiveNodeIds: string[] = [];

    const nodes = await this.dbService.nodes.find({});
    if (nodes.length === 0) {
      throw new BadRequestException('Cannot broadcast since Network has zero nodes');
    }

    nodes.filter(p => !message.recipientAddresses.includes(p.address))
      .forEach(node => {
        try {
          this.messageSender.sendMessage(node.address, message);
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
    this.nodes$.next(await this.getNodeDtos());
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
      this.messages$.next(await this.getMessageDtos());
    }
  }

  async receiveMessage(message: Message) {
    this.logger.debug(`Received Message from ${message.sender}`, message);
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
      default:
      // do nothing
    }
  }

  async requestToJoin() {
    const joinMessage = Message.createMessage(MessageType.joinRequest,
      this.apiConfigService.nodeName,
      JSON.stringify({
        name: this.apiConfigService.nodeName,
        address: this.apiConfigService.p2pLocalAddress
      }));
    await this.sendDirectMessage(this.apiConfigService.p2pNetworkAddress, joinMessage);
  }

  async onModuleInit() {
    this.messages$.next(await this.getMessageDtos());
    this.nodes$.next(await this.getNodeDtos());
  }

  async reset() {
    await this.addNode({
      address: this.apiConfigService.p2pLocalAddress,
      name: this.apiConfigService.nodeName,
      unresponsive: false
    });
    this.nodes$.next(await this.getNodeDtos());
  }
}
