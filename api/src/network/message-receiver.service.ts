import { Injectable, Logger } from '@nestjs/common';
import _ from 'lodash';
import { MessageType, Message, Node, CreateSubmissionDto, VerificationRequestDto } from '@bcr/types';
import { DbService } from '../db/db.service';
import { SubmissionService } from '../submission';
import { EventGateway } from './event.gateway';
import { MessageSenderService } from './message-sender.service';
import { VerificationService } from '../verification';
import { SignatureService } from '../authentication/signature.service';
import { RegistrationMessageDto } from '../types/registration.dto';
import { RegistrationService } from '../registration/registration.service';

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
    private registrationService: RegistrationService
  ) {
  }

  private async storeReceivedMessage(message: Message) {
    const existingMessage = await this.dbService.messages.findOne({ id: message.id });
    if (existingMessage) {
      const allRecipients = existingMessage.recipientAddresses.concat(message.recipientAddresses);
      existingMessage.recipientAddresses = _.uniq(allRecipients);
      await this.dbService.messages.update(existingMessage._id, {
        recipientAddresses: _.uniq(allRecipients)
      });
    } else {
      await this.dbService.messages.insert(message);
      this.eventGateway.emitMessages(await this.messageSenderService.getMessageDtos());
    }
  }

  async receiveMessage(message: Message) {
    this.logger.debug(`Received Message from ${message.senderName}`, { message });
    await this.storeReceivedMessage(message);
    switch (message.type) {
      case MessageType.nodeJoined:
        await this.messageAuthService.verify(message);
        const joiningNode: Node = JSON.parse(message.data);
        await this.messageSenderService.addNode({ ...joiningNode, unresponsive: false });
        break;
      case MessageType.joinRequest:
        const joinMessage: Node = JSON.parse(message.data);
        await this.messageSenderService.processApprovedNode(joinMessage);
        break;
      case MessageType.nodeList:
        await this.messageAuthService.verify(message);
        const nodes: Node[] = JSON.parse(message.data);
        for (const node of nodes) {
          await this.messageSenderService.addNode(node);
        }
        break;
      case MessageType.submission:
        await this.messageAuthService.verify(message);
        const createSubmissionDto: CreateSubmissionDto = JSON.parse(message.data);
        await this.submissionService.createSubmission(createSubmissionDto);
        break;
      case MessageType.verify:
        await this.messageAuthService.verify(message);
        const verificationRequestDto: VerificationRequestDto = JSON.parse(message.data);
        await this.verificationService.verify(verificationRequestDto, true);
        break;
      case MessageType.registration:
        await this.messageAuthService.verifyRegistration(message);
        const registrationMessage: RegistrationMessageDto = JSON.parse(message.data);
        await this.registrationService.processRegistration(registrationMessage);
        break;

      default:
      // do nothing
    }
  }
}
