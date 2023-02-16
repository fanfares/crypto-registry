import { Injectable } from '@nestjs/common';
import { DbApi } from './db-api';
import { MockAddress, MockAddressRecord, MockTransactionRecord, Transaction } from '../crypto';
import { MongoService } from './mongo.service';
import {
  CustomerHolding,
  CustomerHoldingRecord,
  Exchange,
  ExchangeRecord,
  Message,
  MessageRecord,
  Node,
  NodeRecord,
  Submission,
  SubmissionRecord
} from '@bcr/types';
import { WalletAddress, WalletAddressRecord } from '../types/wallet-address-db.types';
import { ApprovalBase, ApprovalRecord, RegistrationRecord, RegistrationTypes } from '../types/registration.types';
import { ApiConfigService } from '../api-config';
import { UserBase, UserRecord } from '../types/user.types';

@Injectable()
export class DbService {
  mockTransactions: DbApi<Transaction, MockTransactionRecord>;
  mockAddresses: DbApi<MockAddress, MockAddressRecord>;
  walletAddresses: DbApi<WalletAddress, WalletAddressRecord>;
  customerHoldings: DbApi<CustomerHolding, CustomerHoldingRecord>;
  submissions: DbApi<Submission, SubmissionRecord>;
  exchanges: DbApi<Exchange, ExchangeRecord>;
  registrations: DbApi<RegistrationTypes, RegistrationRecord>;
  approvals: DbApi<ApprovalBase, ApprovalRecord>;
  nodes: DbApi<Node, NodeRecord>;
  messages: DbApi<Message, MessageRecord>;
  users: DbApi<UserBase, UserRecord>;

  constructor(
    private mongoService: MongoService,
    private apiConfigService: ApiConfigService
  ) {
    const prefix = apiConfigService.isTestMode ? apiConfigService.nodeName : '';
    this.mockTransactions = new DbApi<Transaction, MockTransactionRecord>(mongoService, `${prefix}mock-tx`);
    this.mockAddresses = new DbApi<MockAddress, MockAddressRecord>(mongoService, `${prefix}mock-addresses`);
    this.walletAddresses = new DbApi<WalletAddress, WalletAddressRecord>(mongoService, `${prefix}wallet-addresses`);
    this.customerHoldings = new DbApi<CustomerHolding, CustomerHoldingRecord>(mongoService, `${prefix}customer-holdings`);
    this.submissions = new DbApi<Submission, SubmissionRecord>(mongoService, `${prefix}submissions`);
    this.exchanges = new DbApi<Exchange, ExchangeRecord>(mongoService, `${prefix}exchanges`);
    this.registrations = new DbApi<RegistrationTypes, RegistrationRecord>(mongoService, `${prefix}registrations`);
    this.approvals = new DbApi<ApprovalBase, ApprovalRecord>(mongoService, `${prefix}approvals`);
    this.nodes = new DbApi<Node, NodeRecord>(mongoService, `${prefix}nodes`);
    this.messages = new DbApi<Message, MessageRecord>(mongoService, `${prefix}messages`);
    this.users = new DbApi<UserBase, UserRecord>(mongoService, `${prefix}users`);
  }

  async reset() {
    await this.mockTransactions.deleteMany({});
    await this.mockAddresses.deleteMany({});
    await this.walletAddresses.deleteMany({});
    await this.customerHoldings.deleteMany({});
    await this.submissions.deleteMany({});
    await this.exchanges.deleteMany({});
    await this.registrations.deleteMany({});
    await this.approvals.deleteMany({});
    await this.nodes.deleteMany({});
    await this.messages.deleteMany({});
    await this.users.deleteMany({});
  }

  async close() {
    await this.mongoService.close();
  }
}
