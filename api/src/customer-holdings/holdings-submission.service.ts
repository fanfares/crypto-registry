import { Injectable, Logger } from '@nestjs/common';
import { CustomerHoldingDto, HoldingsSubmissionDto } from '@bcr/types';
import { DbService } from '../db/db.service';
import { holdingsSubmissionStatusRecordToDto } from './holdings-submission-record-to-dto';
import { ExchangeService } from '../exchange/exchange.service';
import { validateHoldings } from './validate-holdings';

@Injectable()
export class HoldingsSubmissionService {
  private logger= new Logger(HoldingsSubmissionService.name);

  constructor(
    protected db: DbService,
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
    holdings: CustomerHoldingDto[]
  ): Promise<string> {
    this.logger.log('create holdings submission:', {exchangeId, holdings});

    validateHoldings(holdings);

    const totalCustomerFunds = holdings.reduce((total: number, holding: CustomerHoldingDto) => total + holding.amount, 0);

    await this.db.holdingsSubmissions.updateMany({
      exchangeId: exchangeId,
      isCurrent: true
    }, {
      isCurrent: false
    });

    await this.db.holdings.updateMany({
      exchangeId: exchangeId,
      isCurrent: true
    }, {
      isCurrent: false
    });

    const submissionId = await this.db.holdingsSubmissions.insert({
      totalHoldings: totalCustomerFunds,
      isCurrent: true,
      exchangeId: exchangeId
    });

    await this.db.holdings.insertMany(holdings.map((holding) => ({
      hashedEmail: holding.hashedEmail?.toLowerCase() ?? undefined,
      amount: holding.amount,
      holdingsSubmissionId: submissionId,
      exchangeId: exchangeId,
      exchangeUid: holding.exchangeUid ?? undefined,
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
