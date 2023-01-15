import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Peer } from './peer';
import { ApiConfigService } from '../api-config';
import { Message } from './message';
import _ from 'lodash';
import { MessageSenderService } from './message-sender.service';

@Injectable()
export class P2pService implements OnApplicationBootstrap {

  peers: Peer[] = [];
  messages: Message[] = [];
  myAddress: string;

  constructor(
    public apiConfigService: ApiConfigService,
    private messageSender: MessageSenderService
  ) {
    this.myAddress = this.apiConfigService.p2pLocalAddress;
    this.peers = [new Peer(this.myAddress)];
  }

  getPeers(): Peer[] {
    return Array.from(this.peers.values());
  }

  private async requestToJoin(address: string) {
    const existingPeer = this.peers.find(p => p.address === address);
    if (existingPeer) {
      return;
    }
    const peer = new Peer(address);
    this.peers.push(peer);
    const message = new Message('new-peer', peer.address);
    message.recipientAddresses = [address];
    await this.broadcastMessage(message);
    const peerListMessage = new Message('peer-list', this.peers);
    message.recipientAddresses = [address, this.apiConfigService.p2pLocalAddress];
    await this.messageSender.sendMessage(this.myAddress, address, peerListMessage);
  }

  private async broadcastMessage(message: Message) {
    if (!message.recipientAddresses.includes(this.apiConfigService.p2pLocalAddress)) {
      message.recipientAddresses.push(this.apiConfigService.p2pLocalAddress);
    }
    const unresponsivePeers: Peer[] = [];
    this.peers
      .filter(p => !message.recipientAddresses.includes(p.address))
      .forEach(peer => {
        try {
          this.messageSender.sendMessage(this.apiConfigService.p2pLocalAddress, peer.address, message);
        } catch (err) {
          console.log(err);
          unresponsivePeers.push(peer);
        }
      });
    if (unresponsivePeers.length > 0) {
      this.peers = this.peers.filter(p => !unresponsivePeers.includes(p));
    }
  }

  async receiveMessage(message: Message) {
    console.log(`${this.apiConfigService.p2pLocalAddress} received ${JSON.stringify(message)}`);
    const existingMessage = this.messages.find(m => m.id === message.id);
    if (existingMessage) {
      const allRecipients = existingMessage.recipientAddresses.concat(message.recipientAddresses);
      existingMessage.recipientAddresses = _.uniq(allRecipients);
    } else {
      this.messages.push(message);
    }
    switch (message.payload.type) {
      case 'new-peer':
        this.peers.push(new Peer(message.payload.data));
        break;
      case 'join':
        await this.requestToJoin(message.payload.data);
        break;
      case 'peer-list':
        const peers: Peer[] = this.peers.concat(message.payload.data);
        this.peers = _.uniqBy(peers, 'address');
        break;
      default:
      // do nothing
    }
  }

  async onApplicationBootstrap() {
    if (this.apiConfigService.p2pNetworkAddress) {
      const joinMessage = new Message('join', this.apiConfigService.p2pLocalAddress);
      await this.messageSender.sendMessage(this.apiConfigService.p2pLocalAddress, this.apiConfigService.p2pNetworkAddress, joinMessage);
    }
  }
}
