import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  SubmissionStatus,
  VerificationBase,
  VerificationConfirmationDto,
  VerificationDto,
  VerificationMessageDto,
  VerificationRecord
} from '@bcr/types';
import { getHash } from '../utils';
import { MailService, VerifiedHoldings } from '../mail-service';
import { differenceInDays } from 'date-fns';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { SubmissionService } from '../submission';
import { MessageSenderService } from '../network/message-sender.service';
import { EventGateway } from '../network/event.gateway';
import { getLatestVerificationBlock } from './get-latest-verification-block';
import { SynchronisationService } from '../syncronisation/synchronisation.service';
import { NodeService } from '../node';

@Injectable()
export class VerificationService {

  constructor(
    private dbService: DbService,
    private mailService: MailService,
    private logger: Logger,
    private apiConfigService: ApiConfigService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private submissionService: SubmissionService,
    private messageSenderService: MessageSenderService,
    private eventGateway: EventGateway,
    private syncService: SynchronisationService,
    private nodeService: NodeService
  ) {
  }

  async verify(
    verificationMessageDto: VerificationMessageDto
  ): Promise<VerificationDto> {

    const hashedEmail = getHash(verificationMessageDto.email.toLowerCase(), this.apiConfigService.hashingAlgorithm);
    const customerHoldings = await this.dbService.customerHoldings.find({
      hashedEmail: hashedEmail,
      isCurrent: true
    });

    if (customerHoldings.length === 0) {
      throw new BadRequestException('There are no holdings submitted for this email');
    }

    const verifiedHoldings: VerifiedHoldings[] = [];
    for (const customerHolding of customerHoldings) {
      let submission = await this.dbService.submissions.get(customerHolding.submissionId)
      if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        await this.submissionService.getSubmissionDto(submission.paymentAddress);
        submission = await this.dbService.submissions.findOne({
          _id: customerHolding.submissionId
        });
      }

      if (submission.status === SubmissionStatus.CONFIRMED && differenceInDays(new Date(), submission.createdDate) < this.apiConfigService.maxSubmissionAge) {
        verifiedHoldings.push({
          customerHoldingAmount: customerHolding.amount,
          exchangeName: submission.exchangeName
        });
      }
    }

    const sendEmail = this.apiConfigService.nodeAddress === verificationMessageDto.selectedNodeAddress;

    const previousBlock = await getLatestVerificationBlock(this.dbService);
    const precedingHash = previousBlock?.hash ?? 'genesis';
    const newBlockIndex = (previousBlock?.index ?? 0) + 1;
    const hash = getHash(JSON.stringify({
      index: newBlockIndex,
      hashedEmail: hashedEmail,
      selectedNodeAddress: verificationMessageDto.selectedNodeAddress,
      initialNodeAddress: verificationMessageDto.initialNodeAddress,
      requestDate: verificationMessageDto.requestDate
    }) + previousBlock?.hash ?? 'genesis', 'sha256');

    const verificationBase: VerificationBase = {
      index: newBlockIndex,
      hashedEmail: hashedEmail,
      leaderAddress: verificationMessageDto.selectedNodeAddress,
      receivingAddress: verificationMessageDto.initialNodeAddress,
      sentEmail: sendEmail,
      hash: hash,
      precedingHash: precedingHash,
      requestDate: verificationMessageDto.requestDate
    };

    const id = await this.dbService.verifications.insert(verificationBase);

    await this.nodeService.updateStatus(false, this.apiConfigService.nodeAddress, await this.syncService.getSyncRequest())

    if (verifiedHoldings.length === 0) {
      throw new BadRequestException('There are no verified holdings for this email');
    }

    if (sendEmail) {
      try {
        this.logger.log('Sending verification email to ' + verificationMessageDto.email);
        await this.mailService.sendVerificationEmail(verificationMessageDto.email.toLowerCase(), verifiedHoldings, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress);

        await this.dbService.verifications.update(id, {
          confirmedBySender: true
        });

        this.logger.log('Broadcasting Confirmation');
        const verificationDto = this.convertVerificationRecordToDto(await this.dbService.verifications.get(id));
        await this.messageSenderService.broadcastConfirmation(verificationDto);
        return verificationDto;
      } catch (err) {
        this.logger.error(err);
        throw new BadRequestException('We found verified holdings, but were unable to send an email to this address');
      }
    } else {
      return this.convertVerificationRecordToDto(await this.dbService.verifications.get(id));
    }
  }

  private convertVerificationRecordToDto(
    record: VerificationRecord
  ): VerificationDto {
    return {
      index: record.index,
      sentEmail: record.sentEmail,
      receivingAddress: record.receivingAddress,
      hashedEmail: record.hashedEmail,
      leaderAddress: record.leaderAddress,
      requestDate: record.requestDate ?? record.createdDate,
      confirmedBySender: record.confirmedBySender,
      hash: record.hash,
      precedingHash: record.precedingHash
    };
  }

  async getVerificationsByEmail(
    email: string
  ): Promise<VerificationDto[]> {
    return (await this.dbService.verifications.find({
      hashedEmail: getHash(email, this.apiConfigService.hashingAlgorithm)
    }, {
      sort: {
        requestDate: -1
      }
    })).map(this.convertVerificationRecordToDto);
  }

  async confirmVerification(confirmation: VerificationConfirmationDto) {
    let verification = await this.dbService.verifications.findOne({
      hash: confirmation.hash
    });

    if (!verification) {
      this.logger.error('Verification Confirmation Failed; no such verification', {
        address: this.apiConfigService.nodeAddress
      });
      return;
    }

    await this.dbService.verifications.update(verification._id, {
      confirmedBySender: true
    });

    verification = await this.dbService.verifications.get(verification._id);
    this.eventGateway.emitVerificationUpdates(this.convertVerificationRecordToDto(verification));
  }
}
