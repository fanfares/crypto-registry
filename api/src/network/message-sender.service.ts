import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { MessageDto, MessageType, Message, Node, NodeDto, CreateSubmissionDto, NodeRecord } from '@bcr/types';
import { DbService } from '../db/db.service';
import { EventGateway } from './event.gateway';
import { MessageTransportService } from './message-transport.service';
import { SignatureService } from '../authentication/signature.service';

@Injectable()
export class MessageSenderService {

  constructor(
    public apiConfigService: ApiConfigService,
    private messageTransport: MessageTransportService,
    private logger: Logger,
    private dbService: DbService,
    private eventGateway: EventGateway,
    private messageAuthService: SignatureService
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

  private async sendSignedMessage(destination: string, message: Message) {
    try {
      await this.messageTransport.sendMessage(destination, this.messageAuthService.sign(message));
    } catch (err) {
      console.log(err);
      const node = await this.dbService.nodes.findOne({ address: destination });
      await this.dbService.nodes.update(node._id, {
        unresponsive: true
      });
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
    if (nodes.length === 0) {
      throw new BadRequestException('Cannot broadcast since Network has zero nodes');
    }

    const sendPromises = nodes
      .filter(node => !excludedAddresses.includes(node.address))
      .filter(node => !message.recipientAddresses.includes(node.address))
      .filter(node => node.address !== message.senderAddress)
      .map(node => this.sendSignedMessage(node.address, message));

    await Promise.all(sendPromises);
    return message;
  }

  private async sendNodeListToNewJoiner(toNodeAddress: string) {
    const nodeList: Node[] = (await this.dbService.nodes.find({
      address: { $ne: toNodeAddress },
      unresponsive: false
    })).map(node => ({
      nodeName: node.nodeName,
      address: node.address,
      unresponsive: false,
      publicKey: node.publicKey,
      ownerEmail: node.ownerEmail
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
    await this.addNode({ ...newNode, unresponsive: false });
    await this.sendNodeListToNewJoiner(newNode.address);
    await this.sendBroadcastMessage(
      MessageType.nodeJoined,
      JSON.stringify(newNode),
      [newNode.address]
    );
  }

  public async addNode(node: Node): Promise<NodeRecord> {
    let nodeRecord = await this.dbService.nodes.findOne({ address: node.address });
    if (!nodeRecord) {
      const id = await this.dbService.nodes.insert(node);
      nodeRecord = await this.dbService.nodes.get(id);
    }
    this.eventGateway.emitNodes(await this.getNodeDtos());
    return nodeRecord;
  }

  async reset() {
    await this.addNode({
      address: this.apiConfigService.nodeAddress,
      nodeName: this.apiConfigService.nodeName,
      unresponsive: false,
      publicKey: this.messageAuthService.publicKey,
      ownerEmail: this.apiConfigService.ownerEmail
    });
    this.eventGateway.emitNodes(await this.getNodeDtos());
    this.eventGateway.emitMessages(await this.getMessageDtos());
  }
}
