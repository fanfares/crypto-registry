import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { ExchangeRecord, ExchangeStatus } from '@bcr/types';
import { FundingAddressStatus } from '../types/funding-address.type';

@Injectable()
export class ExchangeService {

  constructor(
    private db: DbService,
    private apiConfigService: ApiConfigService
  ) {
  }

  async updateStatus(exchangeId: string): Promise<ExchangeRecord> {
    const fundingAddresses = await this.db.fundingAddresses.find({
      exchangeId: exchangeId,
      status: FundingAddressStatus.ACTIVE
    }, {
      sort: {
        signatureDate: -1
      }
    });

    const holdings = await this.db.holdingsSubmissions.findOne({
      isCurrent: true,
      exchangeId: exchangeId
    });

    const currentHoldings = holdings?.totalHoldings ?? null;
    const currentFunds = fundingAddresses.reduce((total, address) => {
      return total + address.balance;
    }, 0);

    let status: ExchangeStatus = ExchangeStatus.OK;
    if (!holdings || fundingAddresses.length === 0) {
      status = ExchangeStatus.AWAITING_DATA;
    } else if (currentFunds < (currentHoldings * this.apiConfigService.reserveLimit)) {
      status = ExchangeStatus.INSUFFICIENT_FUNDS;
    }

    await this.db.exchanges.update(exchangeId, {
      status: status,
      currentFunds: currentFunds,
      currentHoldings: currentHoldings,
      shortFall: currentFunds < currentHoldings ? currentHoldings - currentFunds : null,
      fundingAsAt: fundingAddresses.length > 0 ? fundingAddresses[0]?.signatureDate : null,
      holdingsAsAt: holdings?.updatedDate ?? null,
      fundingSource: fundingAddresses.length > 0 ? fundingAddresses[0]?.network : null
    });

    return await this.db.exchanges.get(exchangeId);
  }

  async createExchange(
    name: string
  ): Promise<ExchangeRecord> {
    const id = await this.db.exchanges.insert({
      name: name,
      status: ExchangeStatus.AWAITING_DATA,
      currentFunds: null,
      currentHoldings: null,
      fundingSource: null
    });
    return await this.db.exchanges.get(id);
  }
  async get(exchangeId: string): Promise<ExchangeRecord> {
    return await this.db.exchanges.get(exchangeId);
  }

  async updateExchange(
    exchangeId: string,
    name: string
  ): Promise<ExchangeRecord> {
    await this.db.exchanges.update(exchangeId, {name});
    return this.get(exchangeId);
  }

}
