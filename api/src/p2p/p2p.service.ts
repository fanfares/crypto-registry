import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Node } from './node';
import { ApiConfigService } from '../api-config';
import { Message, MessageType, MessageDto } from './message';
import _ from 'lodash';
import { MessageSenderService } from './message-sender.service';
import { Subject } from 'rxjs';
import { JoinMessageData } from '../types/join-message-data';

@Injectable()
export class P2pService implements OnModuleInit {

  nodes: Node[] = [];
  messages: MessageDto[] = [];
  nodes$: Subject<Node[]>;
  messages$: Subject<MessageDto[]>;

  constructor(
    public apiConfigService: ApiConfigService,
    private messageSender: MessageSenderService,
    private logger: Logger
  ) {
    this.nodes = [{
      address: this.apiConfigService.p2pLocalAddress,
      name: this.apiConfigService.nodeName,
      isLocal: true
    }];
    this.nodes$ = new Subject<Node[]>();
    this.messages$ = new Subject<MessageDto[]>();
  }

  async getNodes(): Promise<Node[]> {
    return this.nodes;
  }

  private async processJoinRequest(joinMessageData: JoinMessageData) {
    const existingPeer = this.nodes.find(p => p.address === joinMessageData.address);
    if (existingPeer) {
      return;
    }
    const node: Node = { ...joinMessageData, isLocal: false };
    this.nodes.push(node);
    const nodeJoinedMessage = Message.createMessage(MessageType.nodeJoined, this.apiConfigService.nodeName, JSON.stringify(joinMessageData));
    nodeJoinedMessage.recipientAddresses = [joinMessageData.address];
    await this.broadcastMessage(nodeJoinedMessage);
    const nodeList: Node[] = this.nodes.filter(p => p.address !== joinMessageData.address).map(p => ({
      name: p.name,
      address: p.address,
      isLocal: false
    }));
    const nodeListMessage = Message.createMessage(MessageType.nodeList, this.apiConfigService.nodeName, JSON.stringify(nodeList));
    nodeListMessage.recipientAddresses = [joinMessageData.address, this.apiConfigService.p2pLocalAddress];
    this.messages.push({ ...nodeListMessage, isSender: true });
    this.messages$.next(this.messages);
    await this.messageSender.sendMessage(joinMessageData.address, nodeListMessage);
  }

  async broadcastMessage(message: Message) {
    this.logger.debug('Broadcast Message', message);
    if (!message.recipientAddresses.includes(this.apiConfigService.p2pLocalAddress)) {
      message.recipientAddresses.push(this.apiConfigService.p2pLocalAddress);
    }
    this.messages.push({ ...message, isSender: true });
    this.messages$.next(this.messages);
    const unresponsivePeers: Node[] = [];
    this.nodes
      .filter(p => !message.recipientAddresses.includes(p.address))
      .forEach(peer => {
        try {
          this.messageSender.sendMessage(peer.address, message);
        } catch (err) {
          console.log(err);
          unresponsivePeers.push(peer);
        }
      });
    if (unresponsivePeers.length > 0) {
      this.nodes = this.nodes.filter(p => !unresponsivePeers.includes(p));
    }
  }

  async receiveMessage(message: Message) {
    this.logger.debug(`Received Message from ${message.sender}`, message);
    const existingMessage = this.messages.find(m => m.id === message.id);
    if (existingMessage) {
      const allRecipients = existingMessage.recipientAddresses.concat(message.recipientAddresses);
      existingMessage.recipientAddresses = _.uniq(allRecipients);
    } else {
      this.messages.push({ ...message, isSender: false });
      this.messages$.next(this.messages);
    }
    switch (message.type) {
      case MessageType.nodeJoined:
        const joinedMessage: JoinMessageData = JSON.parse(message.data);
        this.nodes.push({ ...joinedMessage, isLocal: false });
        this.nodes$.next(this.nodes);
        break;
      case MessageType.joinRequest:
        const joinMessage: JoinMessageData = JSON.parse(message.data);
        await this.processJoinRequest(joinMessage);
        this.nodes$.next(this.nodes);
        break;
      case MessageType.nodeList:
        const receivedAddresses: Node[] = JSON.parse(message.data);
        receivedAddresses.forEach(node => {
          const existingPeer = this.nodes.find(n => n.address === node.address);
          if (!existingPeer) {
            this.nodes.push({ ...node, isLocal: false });
          }
        });
        this.nodes$.next(this.nodes);
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
    this.messages.push({ ...joinMessage, isSender: true });
    this.messages$.next(this.messages);
    await this.messageSender.sendMessage(this.apiConfigService.p2pNetworkAddress, joinMessage);
  }

  onModuleInit(): any {
    this.messages$.next([]);
  }
}
