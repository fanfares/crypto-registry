import { Injectable } from '@nestjs/common';
import { DbApi } from './db-api';
import { MockAddress, MockAddressRecord, MockTransactionRecord, Transaction } from '../crypto';
import { MongoService } from './mongo.service';
import {
  CustomerHolding,
  CustomerHoldingRecord,
  Exchange,
  ExchangeRecord,
  Submission,
  SubmissionRecord
} from '@bcr/types';
import { WalletAddress, WalletAddressRecord } from '../types/wallet-address-db.types';

@Injectable()
export class DbService {
  mockTransactions: DbApi<Transaction, MockTransactionRecord>;
  mockAddresses: DbApi<MockAddress, MockAddressRecord>;
  walletAddresses: DbApi<WalletAddress, WalletAddressRecord>;
  customerHoldings: DbApi<CustomerHolding, CustomerHoldingRecord>;
  submissions: DbApi<Submission, SubmissionRecord>;
  exchanges: DbApi<Exchange, ExchangeRecord>;

  constructor(
    private mongoService: MongoService
  ) {
    this.mockTransactions = new DbApi<Transaction, MockTransactionRecord>(mongoService, 'mock-tx');
    this.mockAddresses = new DbApi<MockAddress, MockAddressRecord>(mongoService, 'mock-addresses');
    this.walletAddresses = new DbApi<WalletAddress, WalletAddressRecord>(mongoService, 'wallet-addresses');
    this.customerHoldings = new DbApi<CustomerHolding, CustomerHoldingRecord>(mongoService, 'customer-holdings');
    this.submissions = new DbApi<Submission, SubmissionRecord>(mongoService, 'submissions');
    this.exchanges = new DbApi<Exchange, ExchangeRecord>(mongoService, 'exchanges');
  }

  async reset() {
    await this.mockTransactions.deleteMany({}, { type: 'reset' });
    await this.mockAddresses.deleteMany({}, { type: 'reset' });
    await this.walletAddresses.deleteMany({}, { type: 'reset' });
    await this.customerHoldings.deleteMany({}, { type: 'reset' });
    await this.submissions.deleteMany({}, { type: 'reset' });
    await this.exchanges.deleteMany({}, { type: 'reset' });
  }
}
