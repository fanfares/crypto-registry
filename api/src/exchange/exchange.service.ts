import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { ExchangeRecord, ExchangeStatus, FundingSubmissionStatus } from '@bcr/types';
import { EventGateway } from '../event-gateway';

@Injectable()
export class ExchangeService {

  constructor(
    private db: DbService,
    private apiConfigService: ApiConfigService,
    private eventGateway: EventGateway,
    private logger: Logger
  ) {
  }

  async updateStatus(exchangeId: string) {
    const funding = await this.db.fundingSubmissions.findOne({
      isCurrent: true,
      exchangeId: exchangeId
    });

    const holdings = await this.db.holdingsSubmissions.findOne({
      isCurrent: true,
      exchangeId: exchangeId
    });

    const currentHoldings = holdings?.totalHoldings ?? null;
    const currentFunds = funding?.totalFunds ?? null;

    let status: ExchangeStatus = ExchangeStatus.OK;
    if (!holdings || !funding) {
      status = ExchangeStatus.AWAITING_DATA;
    } else if (funding.status === FundingSubmissionStatus.RETRIEVING_BALANCES) {
      status = ExchangeStatus.AWAITING_DATA;
    } else if (currentFunds < (currentHoldings * this.apiConfigService.reserveLimit)) {
      status = ExchangeStatus.INSUFFICIENT_FUNDS;
    }

    await this.db.exchanges.update(exchangeId, {
      status: status,
      currentFunds: currentFunds,
      currentHoldings: currentHoldings,
      fundingAsAt: funding?.updatedDate ?? null,
      holdingsAsAt: holdings?.updatedDate ?? null,
      fundingSource: funding?.network ?? null,
    });

    const exchange = await this.db.exchanges.get(exchangeId);
    this.eventGateway.emitExchange(exchange);
  }

  async createExchange(
    name: string
  ): Promise<string> {
    return await this.db.exchanges.insert({
      name: name,
      status: ExchangeStatus.AWAITING_DATA,
      currentFunds: null,
      currentHoldings: null,
      fundingSource: null
    });
  }

  async get(exchangeId: string): Promise<ExchangeRecord> {
    return await this.db.exchanges.get(exchangeId);
  }

}
