import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import {
  CreateSubmissionDto,
  Message,
  MessageType,
  Node,
  NodeRecord,
  SyncDataMessage,
  SyncRequestMessage,
  VerificationConfirmationDto,
  VerificationMessageDto
} from '@bcr/types';
import { DbService } from '../db/db.service';
import { EventGateway } from './event.gateway';
import { MessageTransportService } from './message-transport.service';
import { SignatureService } from '../authentication/signature.service';
import { NodeService } from '../node';
import { SubmissionConfirmationMessage } from '../types/submission-confirmation.types';
import { recordToBase } from '../utils/data/record-to-dto';

@Injectable()
export class MessageSenderService {

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

  private async sendSignedMessage(destination: string, message: Message) {
    try {
      this.logger.log(`send ${message.type} to ${destination}`)
      await this.messageTransport.sendMessage(destination, this.messageAuthService.sign(message));
      await this.nodeService.updateStatus(false, destination);
    } catch (err) {
      this.logger.error('failed to send message', { message, err });
      await this.nodeService.updateStatus(true, destination);
    }
  }

  async sendDirectMessage(
    destinationAddress: string,
    type: MessageType,
    data?: string
  ) {
    const message = Message.createMessage(type, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress, data);
    await this.sendSignedMessage(destinationAddress, message);
  }

  async sendSyncRequestMessage(destinationAddress: string, syncRequest: SyncRequestMessage) {
    await this.sendDirectMessage(destinationAddress, MessageType.syncRequest, JSON.stringify(syncRequest));
  }

  async sendSyncDataMessage(detinationAddress: string, syncData: SyncDataMessage) {
    await this.sendDirectMessage(detinationAddress, MessageType.syncData, JSON.stringify(syncData));
  }

  async broadcastConfirmation(confirmation: VerificationConfirmationDto) {
    await this.sendBroadcastMessage(MessageType.confirmVerification, JSON.stringify(confirmation));
  }

  async broadcastSubmission(createSubmission: CreateSubmissionDto) {
    await this.sendBroadcastMessage(MessageType.submission, JSON.stringify(createSubmission));
  }

  async broadcastVerification(verificationMessageDto: VerificationMessageDto) {
    await this.sendBroadcastMessage(MessageType.verify, JSON.stringify(verificationMessageDto));
  }

  async broadcastPing(syncRequest: SyncRequestMessage, synchronised = false) {
    await this.sendBroadcastMessage(MessageType.ping, JSON.stringify(syncRequest), [], synchronised);
  }

  async broadcastRemoveNode(nodeAddress: string) {
    await this.sendBroadcastMessage(MessageType.removeNode, nodeAddress);
  }

  async broadcastCancelSubmission(paymentAddress: string) {
    await this.sendBroadcastMessage(MessageType.submissionCancellation, paymentAddress);
  }

  async broadcastSubmissionConfirmation(confirmation: SubmissionConfirmationMessage) {
    await this.sendBroadcastMessage(MessageType.confirmSubmissions, JSON.stringify(confirmation));
  }

  // @Cron('5 * * * * *')
  async broadcastNodeList() {
    const localNodeList = await this.nodeService.getNodeDtos();
    await this.sendBroadcastMessage(MessageType.nodeList, JSON.stringify(localNodeList));
  }

  public async sendBroadcastMessage(
    type: MessageType,
    data: string | null,
    excludedAddresses: string[] = [],
    synchronised = false
  ): Promise<Message> {
    const message = Message.createMessage(type, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress, data);
    this.logger.debug('Broadcast Message', message);

    const nodes = await this.dbService.nodes.find({
      blackBalled: false,
      // unresponsive: false
    });
    if (nodes.length < 2) {
      this.logger.debug('No nodes in the network, cannot broadcast message');
      return;
    }

    const messagePromises = nodes
      .filter(node => !excludedAddresses.includes(node.address))
      .filter(node => !message.recipientAddresses.includes(node.address))
      .filter(node => node.address !== message.senderAddress)
      .map(node => this.sendSignedMessage(node.address, message));

    if (this.apiConfigService.syncMessageSending || synchronised) {
      await Promise.all(messagePromises);
      this.logger.log('Broadcast Message Complete (sync)');
    } else {
      Promise.all(messagePromises).then(() => {
        this.logger.log('Broadcast Message Complete');
      });
    }
    return message;
  }

  private async sendNodeListToNewJoiner(toNodeAddress: string) {
    const nodeList: Node[] = (await this.dbService.nodes.find({
      address: { $ne: toNodeAddress }
    })).map(recordToBase<NodeRecord>);

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


}
