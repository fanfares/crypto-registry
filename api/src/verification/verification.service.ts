import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  SubmissionStatus,
  VerificationBase,
  VerificationDto,
  VerificationMessageDto,
  VerificationRecord,
  VerificationStatus
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
import { NodeService } from '../node';
import { DbInsertOptions } from "../db";

@Injectable()
export class VerificationService {

  constructor(
    private db: DbService,
    private mailService: MailService,
    private logger: Logger,
    private apiConfigService: ApiConfigService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private submissionService: SubmissionService,
    private messageSenderService: MessageSenderService,
    private eventGateway: EventGateway,
    private nodeService: NodeService
  ) {
  }

  async createVerification(
    verificationMessageDto: VerificationMessageDto
  ): Promise<string> {
    this.logger.log('Create verification', {
      verificationMessageDto,
      leader: await this.nodeService.getLeaderAddress(),
      thisNode: this.nodeService.getThisNodeAddress()
    })
    if (verificationMessageDto._id) {
      const verification = await this.db.verifications.get(verificationMessageDto._id)
      if (verification) {
        this.logger.log('Receiver received verification index from leader', {verification});
        if (!verificationMessageDto.index) {
          throw new Error('Receiver already as index');
        }
        await this.assignLeaderDerivedData(verification._id, verificationMessageDto.index, verificationMessageDto.leaderAddress, verificationMessageDto.status);
        await this.emitVerification(verification._id)
        return;
      }
    }

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
      let submission = await this.db.submissions.get(customerHolding.submissionId)
      if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        await this.submissionService.getSubmissionDto(submission._id);
        submission = await this.db.submissions.findOne({
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

    // if (this.apiConfigService.syncMessageSending) {
    await this.processVerification({
      ...verificationMessageDto,
      _id: verificationId
    }, verifiedHoldings);
    // } else {
    //   this.processVerification({
    //     ...verificationMessageDto,
    //     _id: verificationId
    //   }, verifiedHoldings)
    //     .then(() => this.logger.log('Process verification complete'))
    //     .catch(err => this.logger.error(err.message, err));
    // }

    return verificationId
  }

  private convertVerificationRecordToDto(
    record: VerificationRecord
  ): VerificationDto {
    return {
      index: record.index,
      receivingAddress: record.receivingAddress,
      hashedEmail: record.hashedEmail,
      leaderAddress: record.leaderAddress,
      requestDate: record.requestDate ?? record.createdDate,
      status: record.status,
      hash: record.hash,
      precedingHash: record.precedingHash
    };
  }

  async getVerificationDto(verificationId: string) {
    const verification = await this.db.verifications.get(verificationId)
    return this.convertVerificationRecordToDto(verification)
  }

  async getVerificationsByEmail(
    email: string
  ): Promise<VerificationDto[]> {
    return (await this.db.verifications.find({
      hashedEmail: getHash(email, this.apiConfigService.hashingAlgorithm)
    }, {
      sort: {
        requestDate: -1
      }
    })).map(this.convertVerificationRecordToDto);
  }

  private async assignLeaderDerivedData(
    verificationId: string,
    index: number,
    leaderAddress: string,
    status: VerificationStatus
  ) {

    const verification = await this.db.verifications.get(verificationId);

    if (!verification) {
      this.logger.log('Cannot find verification', {verificationId});
      return;
    }

    if (verification.index) {
      this.logger.error('Verification already on chain', {verificationId});
      return;
    }

    const previousVerification = await this.db.verifications.findOne({
      index: index - 1
    });

    const precedingHash = previousVerification?.hash ?? 'genesis';

    const newBlockIndex = (previousVerification?.index ?? 0) + 1;
    const hash = getHash(JSON.stringify({
      index: newBlockIndex,
      hashedEmail: verification.hashedEmail,
      requestDate: verification.requestDate
    }) + previousVerification?.hash ?? 'genesis', 'sha256');

    await this.db.verifications.update(verificationId, {
      hash, index, precedingHash, leaderAddress, status
    });

    await this.nodeService.updateStatus(false, this.apiConfigService.nodeAddress, await this.nodeService.getSyncRequest());
  }

  private async emitVerification(verificationId: string) {
    const verification = await this.db.verifications.get(verificationId);
    this.eventGateway.emitVerificationUpdates(verification);
  }

  private async processVerification(
    verificationDto: VerificationMessageDto,
    verifiedHoldings: VerifiedHoldings[],
  ) {

    const leaderAddress = await this.nodeService.getLeaderAddress();
    if (!leaderAddress) {
      throw new BadRequestException('Cannot process verification if leader is not elected')
    }

    if (!verificationDto.index) {
      const isLeader = await this.nodeService.isThisNodeLeader();
      if (isLeader) {
        this.logger.log('Leader received new verification from receiver or as receiver', {verificationDto});
        const previousBlock = await getLatestVerificationBlock(this.db);
        const newSubmissionIndex = (previousBlock?.index ?? 0) + 1;

        this.logger.log(`Leader (${leaderAddress} sending verification email to ${verificationDto.email}`);
        await this.mailService.sendVerificationEmail(verificationDto.email.toLowerCase(), verifiedHoldings, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress);

        await this.assignLeaderDerivedData(verificationDto._id, newSubmissionIndex, leaderAddress, VerificationStatus.SENT);
        await this.messageSenderService.broadcastVerification({
          ...verificationDto,
          status: VerificationStatus.SENT,
          leaderAddress: leaderAddress,
          index: newSubmissionIndex,
        });
      } else {
        this.logger.log('Follower received new verification', {verificationDto});
        await this.db.verifications.update(verificationDto._id, {leaderAddress})
        await this.messageSenderService.sendVerification(leaderAddress, {
          ...verificationDto,
          status: VerificationStatus.RECEIVED,
          leaderAddress: leaderAddress,
        });
      }
    } else {
      this.logger.log('Follower received verification from leader', {verificationDto});
      await this.assignLeaderDerivedData(verificationDto._id, verificationDto.index, leaderAddress, verificationDto.status);
    }
    await this.emitVerification(verificationDto._id);
  }
}
