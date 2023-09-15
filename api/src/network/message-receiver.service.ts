import { Injectable, Logger } from '@nestjs/common';
import {
  CreateSubmissionDto,
  Message,
  MessageType,
  NodeBase,
  SyncDataMessage,
  SyncRequestMessage,
  VerificationMessageDto
} from '@bcr/types';
import { VerificationService } from '../verification';
import { SignatureService } from '../authentication/signature.service';
import { RegistrationMessageDto } from '../types/registration.dto';
import { RegistrationService } from '../registration/registration.service';
import { NodeService } from '../node';
import { SubmissionConfirmationMessage } from '../types/submission-confirmation.types';
import { SyncService } from '../syncronisation/sync.service';
import { AbstractSubmissionService } from '../submission';

@Injectable()
export class MessageReceiverService {

  constructor(
    private logger: Logger,
    private submissionService: AbstractSubmissionService,
    private verificationService: VerificationService,
    private messageAuthService: SignatureService,
    private registrationService: RegistrationService,
    private nodeService: NodeService,
    private syncService: SyncService
  ) {
  }

  async receiveMessage(message: Message) {
    const node = await this.nodeService.getNodeByAddress(message.senderAddress);
    if (node?.blackBalled) {
      this.logger.warn('Ignoring message from blackballed node');
      return;
    }

    const startUpMessages = [
      MessageType.ping,
      MessageType.syncData
    ];

    const thisNode = await this.nodeService.getThisNode();
    if (thisNode.isStarting && !startUpMessages.includes(message.type)) {
      this.logger.warn('Message ignored in startup mode');
      return;
    }

    switch (message.type) {
      case MessageType.nodeJoined:
        await this.messageAuthService.verifySignature(message);
        const joiningNode: NodeBase = JSON.parse(message.data);
        await this.nodeService.addNode({...joiningNode, unresponsive: false});
        break;
      case MessageType.nodeList:
        await this.nodeService.processNodeList(JSON.parse(message.data));
        await this.messageAuthService.verifySignature(message);
        break;
      case MessageType.createSubmission:
        await this.messageAuthService.verifySignature(message);
        const createSubmissionDto: CreateSubmissionDto = JSON.parse(message.data);
        await this.submissionService.createSubmission(createSubmissionDto);
        break;
      case MessageType.verify:
        await this.messageAuthService.verifySignature(message);
        const verificationRequestDto = VerificationMessageDto.parse(message.data);
        await this.verificationService.createVerification(verificationRequestDto);
        break;
      case MessageType.registration:
        await this.messageAuthService.verifyRegistration(message);
        const registrationMessage: RegistrationMessageDto = JSON.parse(message.data);
        await this.registrationService.processRegistration(registrationMessage);
        break;
      case MessageType.submissionCancellation:
        await this.messageAuthService.verifySignature(message);
        await this.submissionService.cancel(message.data);
        break;
      case MessageType.removeNode:
        await this.messageAuthService.verifySignature(message);
        await this.nodeService.removeNode(message.data);
        break;
      case MessageType.discover:
        await this.messageAuthService.verifySignature(message);
        await this.nodeService.processNodeList(JSON.parse(message.data));
        break;
      case MessageType.ping:
        await this.messageAuthService.verifySignature(message);
        this.logger.debug('received ping from ' + message.senderAddress);
        await this.syncService.processPing(message.senderAddress, JSON.parse(message.data));
        break;
      case MessageType.confirmSubmissions:
        await this.messageAuthService.verifySignature(message);
        const submissionConfirmationMessage: SubmissionConfirmationMessage = JSON.parse(message.data);
        await this.submissionService.confirmSubmission(message.senderAddress, submissionConfirmationMessage);
        break;
      case MessageType.syncRequest:
        await this.messageAuthService.verifySignature(message);
        const syncRequest: SyncRequestMessage = JSON.parse(message.data);
        await this.syncService.processSyncRequest(message.senderAddress, syncRequest);
        break;
      case MessageType.syncData:
        await this.messageAuthService.verifySignature(message);
        const syncData: SyncDataMessage = JSON.parse(message.data);
        await this.syncService.processSyncData(message.senderAddress, syncData);
        break;
      default:
      // do nothing
    }
  }

}
