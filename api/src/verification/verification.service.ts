import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  SubmissionStatus,
  VerificationMessageDto,
  VerificationRecord,
  VerificationDto,
  VerificationConfirmationDto,
  VerificationBase
} from '@bcr/types';
import { getHash } from '../utils';
import { MailService, VerifiedHoldings } from '../mail-service';
import { differenceInDays } from 'date-fns';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { SubmissionService } from '../submission';
import { MessageSenderService } from '../network/message-sender.service';

@Injectable()
export class VerificationService {

  constructor(
    private dbService: DbService,
    private mailService: MailService,
    private logger: Logger,
    private apiConfigService: ApiConfigService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private submissionService: SubmissionService,
    private messageSenderService: MessageSenderService
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
      let submission = await this.dbService.submissions.findOne({
        paymentAddress: customerHolding.paymentAddress
      });

      if (!submission) {
        throw new BadRequestException(`Cannot find submission for ${customerHolding.paymentAddress}`);
      }

      if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        await this.submissionService.getSubmissionStatus(submission.paymentAddress);
        submission = await this.dbService.submissions.findOne({
          paymentAddress: customerHolding.paymentAddress
        });
      }

      if (submission.status === SubmissionStatus.VERIFIED && differenceInDays(new Date(), submission.createdDate) < this.apiConfigService.maxSubmissionAge) {
        verifiedHoldings.push({
          customerHoldingAmount: customerHolding.amount,
          exchangeName: submission.exchangeName
        });
      }
    }

    const sendEmail = this.apiConfigService.nodeAddress === verificationMessageDto.selectedNodeAddress;

    const previousBlock = await this.dbService.verifications.findOne({}, {
      sort: {
        requestTime: -1
      },
      limit: 1
    });

    const precedingHash = previousBlock?.hash ?? 'genesis';
    const hash = getHash(JSON.stringify(verificationMessageDto) + previousBlock?.hash ?? 'genesis', 'sha256');

    const verificationBase: VerificationBase = {
      hashedEmail: hashedEmail,
      blockHash: verificationMessageDto.blockHash,
      selectedNodeAddress: verificationMessageDto.selectedNodeAddress,
      initialNodeAddress: verificationMessageDto.initialNodeAddress,
      sentEmail: sendEmail,
      hash: hash,
      precedingHash: precedingHash,
      requestDate: verificationMessageDto.requestDate,
      confirmedBySender: false
    };

    const id = await this.dbService.verifications.insert(verificationBase);

    if (verifiedHoldings.length === 0) {
      throw new BadRequestException('There are no verified holdings for this email');
    }

    if (sendEmail) {
      try {
        this.logger.log('Sending verification email to ' + verificationMessageDto.email);
        await this.mailService.sendVerificationEmail(verificationMessageDto.email.toLowerCase(), verifiedHoldings, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress);

        this.logger.log('Broadcasting Confirmation');
        await this.messageSenderService.broadcastConfirmation(verificationBase);
      } catch (err) {
        this.logger.error(err);
        throw new BadRequestException('We found verified holdings, but were unable to send an email to this address');
      }
    }

    return this.convertVerificationRecordToDto(await this.dbService.verifications.get(id));
  }

  private convertVerificationRecordToDto(
    record: VerificationRecord
  ): VerificationDto {
    return {
      sentEmail: record.sentEmail,
      initialNodeAddress: record.initialNodeAddress,
      blockHash: record.blockHash,
      hashedEmail: record.hashedEmail,
      selectedNodeAddress: record.selectedNodeAddress,
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
    })).map(this.convertVerificationRecordToDto);
  }

  async confirmVerification(confirmation: VerificationConfirmationDto) {
    const record = await this.dbService.verifications.findOne({
      ...confirmation
    });

    if (!record) {
      throw new BadRequestException('No such verification');
    }

    await this.dbService.verifications.update(record._id, {
      confirmedBySender: true
    });
  }
}
