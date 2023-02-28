import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto, Message, MessageDto, MessageType, Node } from '@bcr/types';
import { DbService } from '../db/db.service';
import { EventGateway } from './event.gateway';
import { MessageTransportService } from './message-transport.service';
import { SignatureService } from '../authentication/signature.service';
import { NodeService } from './node.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MessageSenderService implements OnModuleInit {

  constructor(
    public apiConfigService: ApiConfigService,
    private messageTransport: MessageTransportService,
    private logger: Logger,
    private dbService: DbService,
    private eventGateway: EventGateway,
    private messageAuthService: SignatureService,
    private nodeService: NodeService
  ) {
  }


  async getMessageDtos(): Promise<MessageDto[]> {
    return (await this.dbService.messages.find({})).map(message => ({
      ...message,
      isSender: message.senderName === this.apiConfigService.nodeName
    }));
  }

  private async sendSignedMessage(destination: string, message: Message) {
    try {
      await this.messageTransport.sendMessage(destination, this.messageAuthService.sign(message));
      await this.dbService.nodes.findOneAndUpdate({
        address: destination
      }, {
        lastSeen: new Date(),
        unresponsive: false
      });
      this.eventGateway.emitNodes(await this.nodeService.getNodeDtos());
    } catch (err) {
      console.log(err);
      const node = await this.dbService.nodes.findOne({ address: destination });
      if (node) {
        await this.dbService.nodes.update(node._id, {
          unresponsive: true
        });
        this.eventGateway.emitNodes(await this.nodeService.getNodeDtos());
      }
    }
  }

  async sendDirectMessage(
    destinationAddress: string,
    type: MessageType,
    data?: string
  ) {
    const message = Message.createMessage(type, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress, data);
    await this.dbService.messages.insert(message);
    this.eventGateway.emitMessages(await this.getMessageDtos());
    await this.sendSignedMessage(destinationAddress, message);
  }

  async broadcastSubmission(createSubmission: CreateSubmissionDto) {
    await this.sendBroadcastMessage(MessageType.submission, JSON.stringify(createSubmission));
  }

  @Cron('1 * * * * *')
  async broadcastNodeList() {
    const localNodeList = await this.nodeService.getNodeDtos();
    console.log(this.apiConfigService.nodeAddress, '=> ', localNodeList.map(n=>n.address));
    await this.sendBroadcastMessage(MessageType.discover, JSON.stringify(localNodeList));
  }

  async sendBroadcastMessage(
    type: MessageType,
    data: string | null,
    excludedAddresses: string[] = []
  ): Promise<Message> {
    const message = Message.createMessage(type, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress, data);
    this.logger.debug('Broadcast Message', message);
    await this.dbService.messages.insert(message);
    this.eventGateway.emitMessages(await this.getMessageDtos());

    const nodes = await this.dbService.nodes.find({});
    if (nodes.length < 2) {
      this.logger.debug('No nodes in the network, cannot broadcast message');
      return;
    }

    const destinationNodes = nodes
      .filter(node => !excludedAddresses.includes(node.address))
      .filter(node => !message.recipientAddresses.includes(node.address))
      .filter(node => node.address !== message.senderAddress);

    for (const destinationNode of destinationNodes) {
      await this.sendSignedMessage(destinationNode.address, message);
    }

    return message;
  }

  public async sendNodeListToNewJoiner(toNodeAddress: string) {
    const nodeList: Node[] = (await this.dbService.nodes.find({
      address: { $ne: toNodeAddress },
      unresponsive: false
    })).map(node => ({
      nodeName: node.nodeName,
      address: node.address,
      unresponsive: false,
      publicKey: node.publicKey,
      ownerEmail: node.ownerEmail,
      lastSeen: node.lastSeen
    }));

    try {
      await this.sendDirectMessage(toNodeAddress, MessageType.nodeList, JSON.stringify(nodeList));
    } catch (err) {
      throw new BadRequestException(toNodeAddress + ' sends error:' + err.message);
    }
  }

  public async processApprovedNode(newNode: Node) {
    const existingPeer = await this.dbService.nodes.findOne({ address: newNode.address });
    if (existingPeer) {
      return;
    }
    await this.nodeService.addNode({ ...newNode, unresponsive: false });
    await this.sendNodeListToNewJoiner(newNode.address);
    await this.sendBroadcastMessage(
      MessageType.nodeJoined,
      JSON.stringify(newNode),
      [newNode.address]
    );
  }

  async onModuleInit() {
    this.logger.log('Message Sender Service - On Module Init');
    const nodeCount = await this.dbService.nodes.count({
      address: this.apiConfigService.nodeAddress
    });
    if (nodeCount === 0) {
      this.logger.log('Insert local node');
      await this.dbService.nodes.insert({
        address: this.apiConfigService.nodeAddress,
        nodeName: this.apiConfigService.nodeName,
        unresponsive: false,
        publicKey: this.messageAuthService.publicKey,
        ownerEmail: this.apiConfigService.ownerEmail,
        lastSeen: new Date()
      });
      this.eventGateway.emitNodes(await this.nodeService.getNodeDtos());
      this.eventGateway.emitMessages(await this.getMessageDtos());
    }
  }
}
