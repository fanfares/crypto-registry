import { BadRequestException, Injectable } from '@nestjs/common';
import { DbApi } from './db-api';
import { MockAddressBase, MockAddressRecord, MockTransactionRecord, Transaction } from '../crypto';
import { MongoService } from './mongo.service';
import {
  CustomerHoldingBase,
  CustomerHoldingRecord,
  ExchangeBase,
  ExchangeRecord,
  SubmissionBase,
  SubmissionRecord
} from '@bcr/types';
import { ApiConfigService } from '../api-config';

@Injectable()
export class DbService {
  transactions: DbApi<Transaction, MockTransactionRecord>;
  addresses: DbApi<MockAddressBase, MockAddressRecord>;
  customerHoldings: DbApi<CustomerHoldingBase, CustomerHoldingRecord>;
  submissions: DbApi<SubmissionBase, SubmissionRecord>;
  exchanges: DbApi<ExchangeBase, ExchangeRecord>;

  constructor(
    private mongoService: MongoService,
    private apiConfigService: ApiConfigService
  ) {
    this.transactions = new DbApi<Transaction, MockTransactionRecord>(mongoService, 'mock-tx');
    this.addresses = new DbApi<MockAddressBase, MockAddressRecord>(mongoService, 'mock-address');
    this.customerHoldings = new DbApi<CustomerHoldingBase, CustomerHoldingRecord>(mongoService, 'customer-holdings');
    this.submissions = new DbApi<SubmissionBase, SubmissionRecord>(mongoService, 'submissions');
    this.exchanges = new DbApi<ExchangeBase, ExchangeRecord>(mongoService, 'exchanges');
  }

  async reset() {
    if (!this.apiConfigService.isTestMode) {
      throw new BadRequestException('Cannot reset outside test mode');
    }
    await this.transactions.deleteMany({}, { type: 'reset' });
    await this.addresses.deleteMany({}, { type: 'reset' });
    await this.customerHoldings.deleteMany({}, { type: 'reset' });
    await this.submissions.deleteMany({}, { type: 'reset' });
  }
}
