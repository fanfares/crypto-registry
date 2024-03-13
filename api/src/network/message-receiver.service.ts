import { Injectable, Logger } from '@nestjs/common';
import {
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
import { SyncService } from '../syncronisation/sync.service';
import { FundingSubmissionService } from '../funding';

@Injectable()
export class MessageReceiverService {

  constructor(
    private logger: Logger,
    private fundingSubmissionService: FundingSubmissionService,
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
        // const createSubmissionDto: CreateFundingSubmissionDto = JSON.parse(message.data);
        // await this.fundingSubmissionService.createSubmission(createSubmissionDto);
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
        await this.fundingSubmissionService.processCancellation(message.data);
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
      // case MessageType.confirmSubmissions:
      //   await this.messageAuthService.verifySignature(message);
      //   const submissionConfirmationMessage: SubmissionConfirmationMessage = JSON.parse(message.data);
      //   await this.addressSubmissionService.confirmSubmission(message.senderAddress, submissionConfirmationMessage);
      //   break;
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
