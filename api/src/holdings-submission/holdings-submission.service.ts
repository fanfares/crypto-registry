import { Injectable, Logger } from '@nestjs/common';
import { CustomerHoldingDto, HoldingsSubmissionDto, Network } from '@bcr/types';
import { DbService } from '../db/db.service';
import { holdingsSubmissionStatusRecordToDto } from './holdings-submission-record-to-dto';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class HoldingsSubmissionService {

  constructor(
    protected db: DbService,
    protected logger: Logger,
    protected exchangeService: ExchangeService
  ) {
  }

  async getSubmissionDto(
    submissionId: string
  ): Promise<HoldingsSubmissionDto> {
    const submission = await this.db.holdingsSubmissions.get(submissionId);
    const holdings = await this.db.holdings.find({submissionId});
    return holdingsSubmissionStatusRecordToDto(submission, holdings);
  }

  async createSubmission(
    exchangeId: string,
    network: Network,
    holdings: CustomerHoldingDto[]
  ): Promise<string> {
    this.logger.log('create holdings submission:', {network, exchangeId, holdings});

    const totalCustomerFunds = holdings.reduce((total: number, holding: CustomerHoldingDto) => total + holding.amount, 0);

    await this.db.holdingsSubmissions.updateMany({
      exchangeId: exchangeId,
      isCurrent: true,
      network: network
    }, {
      isCurrent: false
    });

    await this.db.holdings.updateMany({
      exchangeId: exchangeId,
      isCurrent: true,
      network: network
    }, {
      isCurrent: false
    });

    const submissionId = await this.db.holdingsSubmissions.insert({
      totalHoldings: totalCustomerFunds,
      isCurrent: true,
      exchangeId: exchangeId,
      network: network
    });

    await this.db.holdings.insertMany(holdings.map((holding) => ({
      hashedEmail: holding.hashedEmail.toLowerCase(),
      amount: holding.amount,
      network: network,
      holdingsSubmissionId: submissionId,
      exchangeId: exchangeId,
      isCurrent: true
    })));

    await this.exchangeService.updateStatus(exchangeId);

    return submissionId;
  }

  async cancel(id: string) {
    await this.db.holdingsSubmissions.update(id, {
      isCurrent: false
    });
  }
}
