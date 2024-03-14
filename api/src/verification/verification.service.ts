import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  ExchangeStatus,
  HoldingRecord,
  VerificationBase,
  VerificationDto,
  VerificationMessageDto,
  VerificationRecord,
  VerificationResultDto,
  VerificationStatus,
  VerifiedHoldingsDto,
  VerifyByUidDto
} from '@bcr/types';
import { getHash } from '../utils';
import { MailService } from '../mail-service';
import { differenceInDays } from 'date-fns';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
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
    protected nodeService: NodeService
  ) {
  }

  async verifyByUid(
    request: VerifyByUidDto
  ): Promise<VerificationResultDto> {
    this.logger.log('UID verification', {
      uid: request.uid
    });

    let holdings = await this.db.holdings.find({
      exchangeUid: request.uid,
      isCurrent: true
    });

    const verifiedHoldings = await this.verifyExchanges(holdings);

    if (holdings.length === 0) {
      throw new BadRequestException('There are no verified holdings for this Exchange UUID');
    }

    const verificationBase: VerificationBase = {
      exchangeUid: request.uid,
      requestDate: new Date(),
      status: VerificationStatus.SUCCESS
    };
    const verificationId = await this.db.verifications.insert(verificationBase);
    return {verificationId, verifiedHoldings};
  }

  async createVerification(
    verificationMessageDto: VerificationMessageDto
  ): Promise<VerificationResultDto> {
    this.logger.log('Create verification', {
      verificationMessageDto,
      leader: await this.nodeService.getLeaderAddress(),
      thisNode: this.nodeService.getThisNodeAddress()
    });

    const hashedEmail = getHash(verificationMessageDto.email.toLowerCase(), this.apiConfigService.hashingAlgorithm);
    const holdings = await this.db.holdings.find({
      hashedEmail: hashedEmail,
      isCurrent: true
    });

    const verifiedHoldings = await this.verifyExchanges(holdings);


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
      verifiedHoldings, this.apiConfigService.institutionName
    );

    await this.db.verifications.update(verificationId, {
      status: VerificationStatus.SUCCESS
    });

    return {verificationId, verifiedHoldings};
  }

  protected async verifyExchanges(
    holdings: HoldingRecord[]
  ): Promise<VerifiedHoldingsDto[]> {
      const verifiedHoldings: VerifiedHoldingsDto[] = [];
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
}
