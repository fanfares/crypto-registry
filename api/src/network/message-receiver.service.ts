import { Injectable, Logger } from '@nestjs/common';
import {
  CreateSubmissionDto,
  Message,
  MessageType,
  Node,
  SyncDataMessage,
  SyncRequestMessage,
  VerificationConfirmationDto,
  VerificationMessageDto
} from '@bcr/types';
import { DbService } from '../db/db.service';
import { EventGateway } from './event.gateway';
import { VerificationService } from '../verification';
import { SignatureService } from '../authentication/signature.service';
import { RegistrationMessageDto } from '../types/registration.dto';
import { RegistrationService } from '../registration/registration.service';
import { NodeService } from '../node';
import { ApiConfigService } from '../api-config';
import { SubmissionConfirmationMessage } from '../types/submission-confirmation.types';
import { MessageSenderService } from './message-sender.service';
import { SynchronisationService } from '../syncronisation/synchronisation.service';
import { SubmissionService } from '../submission';

@Injectable()
export class MessageReceiverService {

  constructor(
    private logger: Logger,
    private dbService: DbService,
    private submissionService: SubmissionService,
    private eventGateway: EventGateway,
    private messageSenderService: MessageSenderService,
    private verificationService: VerificationService,
    private messageAuthService: SignatureService,
    private registrationService: RegistrationService,
    private nodeService: NodeService,
    private apiConfigService: ApiConfigService,
    private syncService: SynchronisationService
  ) {
  }

  async receiveMessage(message: Message) {
    const node = await this.nodeService.getNodeByAddress(message.senderAddress);
    if (node.blackBalled) {
      this.logger.warn('Ignoring message from blackballed node');
      return;
    }
    switch (message.type) {
      case MessageType.nodeJoined:
        await this.messageAuthService.verify(message);
        const joiningNode: Node = JSON.parse(message.data);
        await this.nodeService.addNode({ ...joiningNode, unresponsive: false });
        break;
      case MessageType.nodeList:
        await this.nodeService.processNodeList(JSON.parse(message.data));
        await this.messageAuthService.verify(message);
        break;
      case MessageType.submission:
        await this.messageAuthService.verify(message);
        const createSubmissionDto: CreateSubmissionDto = JSON.parse(message.data);
        await this.submissionService.createSubmission(createSubmissionDto);
        break;
      case MessageType.verify:
        await this.messageAuthService.verify(message);
        const verificationRequestDto: VerificationMessageDto = JSON.parse(message.data);
        await this.verificationService.verify(verificationRequestDto);
        break;
      case MessageType.registration:
        await this.messageAuthService.verifyRegistration(message);
        const registrationMessage: RegistrationMessageDto = JSON.parse(message.data);
        await this.registrationService.processRegistration(registrationMessage);
        break;
      case MessageType.submissionCancellation:
        await this.messageAuthService.verify(message);
        await this.submissionService.cancel(message.data);
        break;
      case MessageType.removeNode:
        await this.messageAuthService.verify(message);
        await this.nodeService.removeNode(message.data);
        break;
      case MessageType.discover:
        await this.messageAuthService.verify(message);
        await this.nodeService.processNodeList(JSON.parse(message.data));
        break;
      case MessageType.ping:
        await this.messageAuthService.verify(message);
        this.logger.log('received ping from ' + message.senderAddress);
        await this.syncService.processPing(message.senderAddress, JSON.parse(message.data));
        break;
      case MessageType.confirmVerification:
        await this.messageAuthService.verify(message);
        const verificationConfirmationMessage: VerificationConfirmationDto = JSON.parse(message.data);
        await this.verificationService.confirmVerification(verificationConfirmationMessage);
        break;
      case MessageType.confirmSubmissions:
        await this.messageAuthService.verify(message);
        const submissionConfirmationMessage: SubmissionConfirmationMessage = JSON.parse(message.data);
        await this.submissionService.confirmSubmission(message.senderAddress, submissionConfirmationMessage);
        break;
      case MessageType.syncRequest:
        await this.messageAuthService.verify(message);
        const syncRequest: SyncRequestMessage = JSON.parse(message.data);
        await this.syncService.processSyncRequest(message.senderAddress, syncRequest);
        break;
      case MessageType.syncData:
        await this.messageAuthService.verify(message);
        const syncData: SyncDataMessage = JSON.parse(message.data);
        await this.syncService.processSyncData(syncData);
        break;
      default:
      // do nothing
    }
  }

}
