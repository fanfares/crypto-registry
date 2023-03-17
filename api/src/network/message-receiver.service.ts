import { Injectable, Logger } from '@nestjs/common';
import {
  CreateSubmissionDto,
  Message,
  MessageType,
  Node,
  NodeDto,
  VerificationMessageDto,
  VerificationConfirmationDto
} from '@bcr/types';
import { DbService } from '../db/db.service';
import { SubmissionService } from '../submission';
import { EventGateway } from './event.gateway';
import { MessageSenderService } from './message-sender.service';
import { VerificationService } from '../verification';
import { SignatureService } from '../authentication/signature.service';
import { RegistrationMessageDto } from '../types/registration.dto';
import { RegistrationService } from '../registration/registration.service';
import { NodeService } from './node.service';
import { ApiConfigService } from '../api-config';

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
    private apiConfigService: ApiConfigService
  ) {
  }

  async receiveMessage(message: Message) {
    this.logger.debug(`${this.apiConfigService.nodeAddress} <= ${message.senderAddress}`);
    switch (message.type) {
      case MessageType.nodeJoined:
        await this.messageAuthService.verify(message);
        const joiningNode: Node = JSON.parse(message.data);
        await this.nodeService.addNode({ ...joiningNode, unresponsive: false });
        break;
      case MessageType.nodeList:
        await this.processNodeList(message);
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
        await this.processDiscovery(JSON.parse(message.data));
        break;
      case MessageType.ping:
        await this.messageAuthService.verify(message);
        this.logger.log('received ping from ' + message.senderAddress);
        break;
      case MessageType.confirmVerification:
        await this.messageAuthService.verify(message);
        const confirmationMessage:VerificationConfirmationDto = JSON.parse(message.data);
        await this.verificationService.confirmVerification(confirmationMessage)
        break;
      default:
      // do nothing
    }
  }

  private async processDiscovery(nodeList: NodeDto[]) {
    for (const node of nodeList) {
      await this.nodeService.addNode(node);
    }
  }

  private async processNodeList(message: Message) {
    const nodes: Node[] = JSON.parse(message.data);
    for (const node of nodes) {
      await this.nodeService.addNode(node);
    }
  }
}
