import { DbApi, MongoService } from '../db';
import { MockAddressBase, MockAddressRecord, MockTransactionRecord } from './mock-address.types';
import { Injectable } from '@nestjs/common';
import { Transaction } from './bitcoin.service';

@Injectable()
export class MockAddressDbService extends DbApi<MockAddressBase, MockAddressRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'mock-addresses');
    this.transactions = new DbApi<Transaction, MockTransactionRecord>(mongoService, 'mock-txs');
  }

  transactions: DbApi<Transaction, MockTransactionRecord>;
}
