import { Injectable } from '@nestjs/common';
import { Peer } from './peer';
import { ApiConfigService } from '../api-config';
import { Message, MessageType } from './message';
import _ from 'lodash';
import { MessageSenderService } from './message-sender.service';
import { Subject } from 'rxjs';

@Injectable()
export class P2pService {

  peers: Peer[] = [];
  messages: Message[] = [];
  myAddress: string;
  peers$: Subject<Peer[]>

  constructor(
    public apiConfigService: ApiConfigService,
    private messageSender: MessageSenderService
  ) {
    this.myAddress = this.apiConfigService.p2pLocalAddress;
    this.peers = [{
      address: this.myAddress,
      isLocal: true
    }];
    this.peers$ = new Subject<Peer[]>()
  }

  async getPeers(): Promise<Peer[]> {
    return this.peers;
  }

  private async requestToJoin(address: string) {
    const existingPeer = this.peers.find(p => p.address === address);
    if (existingPeer) {
      return;
    }
    const peer: Peer = { address, isLocal: false };
    this.peers.push(peer);
    const message = Message.createMessage(MessageType.newAddress,  peer.address );
    message.recipientAddresses = [address];
    await this.broadcastMessage(message);
    const peerList = this.peers.filter(p => p.address !== address).map(p =>  p.address)
    const peerListMessage = Message.createMessage(MessageType.addressList, JSON.stringify(peerList));
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
    switch (message.type) {
      case MessageType.newAddress:
        this.peers.push({ address: message.data, isLocal: false });
        this.peers$.next(this.peers);
        break;
      case MessageType.join:
        await this.requestToJoin(message.data);
        this.peers$.next(this.peers);
        break;
      case MessageType.addressList:
        const receivedAddresses: string[] = JSON.parse(message.data);
        receivedAddresses.forEach(address => {
          const existingPeer = this.peers.find(p => p.address === address)
          if ( !existingPeer ) {
            this.peers.push({ address, isLocal: false })
          }
        })
        this.peers$.next(this.peers);
        break;
      default:
      // do nothing
    }
  }

  async joinNetwork() {
    const joinMessage = Message.createMessage(MessageType.join,  this.apiConfigService.p2pLocalAddress );
    await this.messageSender.sendMessage(this.apiConfigService.p2pLocalAddress, this.apiConfigService.p2pNetworkAddress, joinMessage);
  }
}
