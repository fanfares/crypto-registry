import { Injectable } from '@nestjs/common';
import { DbApi } from './db-api';
import { MockAddress, MockAddressRecord, MockTransactionRecord, Transaction } from '../crypto';
import { MongoService } from './mongo.service';
import {
  CustomerHolding,
  CustomerHoldingRecord,
  Exchange,
  ExchangeRecord,
  Node,
  NodeRecord,
  Submission,
  SubmissionRecord
} from '@bcr/types';
import { WalletAddress, WalletAddressRecord } from '../types/wallet-address-db.types';
import { ApprovalBase, ApprovalRecord, RegistrationRecord, RegistrationTypes } from '../types/registration.types';
import { ApiConfigService } from '../api-config';
import { UserBase, UserRecord } from '../types/user.types';
import { VerificationBase, VerificationRecord } from '../types/verification-db.types';

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
  users: DbApi<UserBase, UserRecord>;
  verifications: DbApi<VerificationBase, VerificationRecord>;

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
    this.users = new DbApi<UserBase, UserRecord>(mongoService, `${prefix}users`);
    this.verifications = new DbApi<VerificationBase, VerificationRecord>(mongoService, `${prefix}verifications`);
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
    await this.users.deleteMany({});
    await this.verifications.deleteMany({});
  }

  async close() {
    await this.mongoService.close();
  }
}
