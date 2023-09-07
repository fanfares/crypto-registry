import { BadRequestException, Logger } from '@nestjs/common';
import {
  SubmissionStatus,
  VerificationBase,
  VerificationDto,
  VerificationMessageDto,
  VerificationRecord
} from '@bcr/types';
import { getHash } from '../utils';
import { MailService, VerifiedHoldings } from '../mail-service';
import { differenceInDays, format } from 'date-fns';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { AbstractSubmissionService } from '../submission';
import { EventGateway } from '../network/event.gateway';
import { NodeService } from '../node';
import { DbInsertOptions } from "../db";

export interface VerificationResponse {
  verificationId: string,
  verifiedHoldings: VerifiedHoldings[]
}

export abstract class VerificationService {

  protected constructor(
    protected db: DbService,
    protected mailService: MailService,
    protected logger: Logger,
    protected apiConfigService: ApiConfigService,
    protected submissionService: AbstractSubmissionService,
    protected eventGateway: EventGateway,
    protected nodeService: NodeService
  ) {
  }

  async createVerification(
    verificationMessageDto: VerificationMessageDto
  ): Promise<VerificationResponse> {
    this.logger.log('Create verification', {
      verificationMessageDto,
      leader: await this.nodeService.getLeaderAddress(),
      thisNode: this.nodeService.getThisNodeAddress()
    })

    const hashedEmail = getHash(verificationMessageDto.email.toLowerCase(), this.apiConfigService.hashingAlgorithm);
    const customerHoldings = await this.db.customerHoldings.find({
      hashedEmail: hashedEmail,
      isCurrent: true
    });

    if (customerHoldings.length === 0) {
      throw new BadRequestException('There are no holdings submitted for this email');
    }

    const verifiedHoldings: VerifiedHoldings[] = [];
    for (const customerHolding of customerHoldings) {
      const submission = await this.db.submissions.get(customerHolding.submissionId)
      if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        continue;
      }

      if (submission.status === SubmissionStatus.CONFIRMED && differenceInDays(new Date(), submission.createdDate) < this.apiConfigService.maxSubmissionAge) {
        verifiedHoldings.push({
          customerHoldingAmount: customerHolding.amount,
          exchangeName: submission.exchangeName,
          submissionDate: format(submission.confirmationDate, 'dd MMM yyyy')
        });
      }
    }

    if (verifiedHoldings.length === 0) {
      throw new BadRequestException('There are no verified holdings for this email');
    }

    let options: DbInsertOptions = null;
    if (verificationMessageDto._id) {
      options = {_id: verificationMessageDto._id}
    }

    const verificationBase: VerificationBase = {
      hashedEmail: hashedEmail,
      receivingAddress: verificationMessageDto.receivingAddress,
      leaderAddress: verificationMessageDto.leaderAddress,
      requestDate: verificationMessageDto.requestDate,
      status: verificationMessageDto.status
    };

    const verificationId = await this.db.verifications.insert(verificationBase, options);
    await this.emitVerification(verificationId)

    await this.processVerification(verificationId, verifiedHoldings, verificationMessageDto.email);

    return {verificationId, verifiedHoldings}
  }

  private convertVerificationRecordToDto(record: VerificationRecord): VerificationDto {
    return {
      receivingAddress: record.receivingAddress,
      hashedEmail: record.hashedEmail,
      leaderAddress: record.leaderAddress,
      requestDate: record.requestDate ?? record.createdDate,
      status: record.status,
      hash: record.hash,
    };
  }

  async getVerificationDto(verificationId: string) {
    const verification = await this.db.verifications.get(verificationId)
    return this.convertVerificationRecordToDto(verification)
  }

  async getVerificationsByEmail(email: string): Promise<VerificationDto[]> {
    const verifications = await this.db.verifications.find({
      hashedEmail: getHash(email, this.apiConfigService.hashingAlgorithm)
    }, {
      sort: {
        requestDate: -1
      }
    })

    return verifications.map(this.convertVerificationRecordToDto);
  }

  protected async emitVerification(verificationId: string) {
    const verification = await this.db.verifications.get(verificationId);
    this.eventGateway.emitVerificationUpdates(verification);
  }

  protected abstract processVerification(
    verificationId: string,
    verifiedHoldings: VerifiedHoldings[],
    requesterEmail: string
  ): Promise<void>
}
