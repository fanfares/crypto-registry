import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  ExchangeStatus,
  VerificationBase,
  VerificationDto,
  VerificationMessageDto,
  VerificationRecord,
  VerificationResponse,
  VerificationStatus,
  VerifiedHoldings
} from '@bcr/types';
import { getHash } from '../utils';
import { MailService } from '../mail-service';
import { differenceInDays } from 'date-fns';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { EventGateway } from '../event-gateway';
import { NodeService } from '../node';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class VerificationService {

  constructor(
    protected db: DbService,
    protected mailService: MailService,
    protected logger: Logger,
    protected apiConfigService: ApiConfigService,
    protected exchangeService: ExchangeService,
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
    });

    const hashedEmail = getHash(verificationMessageDto.email.toLowerCase(), this.apiConfigService.hashingAlgorithm);
    const verifiedHoldings = await this.getVerifiedHoldings(hashedEmail);

    if (verifiedHoldings.length === 0) {
      throw new BadRequestException('There are no verified holdings for this email');
    }

    const verificationBase: VerificationBase = {
      hashedEmail: hashedEmail,
      receivingAddress: verificationMessageDto.receivingAddress,
      leaderAddress: verificationMessageDto.leaderAddress,
      requestDate: verificationMessageDto.requestDate,
      status: verificationMessageDto.status
    };

    const verificationId = await this.db.verifications.insert(verificationBase);

    this.logger.log(`Single Node sending verification email to ${verificationMessageDto.email}`);
    await this.mailService.sendVerificationEmail(verificationMessageDto.email.toLowerCase(),
      verifiedHoldings, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress
    );

    await this.db.verifications.update(verificationId, {
      status: VerificationStatus.SENT
    });

    await this.emitVerification(verificationId);
    return {verificationId, verifiedHoldings};
  }

  protected async getVerifiedHoldings(hashedEmail: string) {
    const holdings = await this.db.holdings.find({
      hashedEmail: hashedEmail,
      isCurrent: true
    });

    if (holdings.length === 0) {
      throw new BadRequestException('There are no holdings submitted for this email');
    }

    const verifiedHoldings: VerifiedHoldings[] = [];
    for (const customerHolding of holdings) {
      const exchange = await this.exchangeService.get(customerHolding.exchangeId);

      if (exchange.status === ExchangeStatus.OK && differenceInDays(new Date(), exchange.fundingAsAt) < this.apiConfigService.maxSubmissionAge) {
        verifiedHoldings.push({
          holdingId: customerHolding._id,
          customerHoldingAmount: customerHolding.amount,
          exchangeName: exchange.name,
          fundingAsAt: exchange.fundingAsAt,
          fundingSource: exchange.fundingSource
        });
      }
    }
    return verifiedHoldings;
  }

  private convertVerificationRecordToDto(record: VerificationRecord): VerificationDto {
    return {
      receivingAddress: record.receivingAddress,
      hashedEmail: record.hashedEmail,
      leaderAddress: record.leaderAddress,
      requestDate: record.requestDate ?? record.createdDate,
      status: record.status
    };
  }

  async getVerificationDto(verificationId: string) {
    const verification = await this.db.verifications.get(verificationId);
    return this.convertVerificationRecordToDto(verification);
  }

  async getVerificationsByEmail(email: string): Promise<VerificationDto[]> {
    const verifications = await this.db.verifications.find({
      hashedEmail: getHash(email, this.apiConfigService.hashingAlgorithm)
    }, {
      sort: {
        requestDate: -1
      }
    });

    return verifications.map(this.convertVerificationRecordToDto);
  }

  protected async emitVerification(verificationId: string) {
    const verification = await this.db.verifications.get(verificationId);
    this.eventGateway.emitVerificationUpdates(verification);
  }


}
