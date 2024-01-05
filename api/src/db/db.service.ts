import { Injectable } from '@nestjs/common';
import { DbApi } from './db-api';
import { MockAddress, MockAddressRecord, MockTransactionRecord, Transaction } from '../crypto';
import { MongoService } from './mongo.service';
import {
  FundingSubmissionBase,
  FundingSubmissionRecord,
  HoldingBase,
  HoldingRecord,
  ExchangeBase,
  ExchangeRecord,
  NodeBase,
  NodeRecord,
  VerificationBase,
  VerificationRecord, HoldingsSubmissionBase, HoldingsSubmissionsRecord
} from '@bcr/types';
import { WalletAddress, WalletAddressRecord } from '../types/wallet-address-db.types';
import { ApprovalBase, ApprovalRecord, RegistrationRecord, RegistrationTypes } from '../types/registration.types';
import { ApiConfigService } from '../api-config';
import { UserBase, UserRecord } from '../types/user.types';
import { SubmissionConfirmationBase, SubmissionConfirmationRecord } from '../types/submission-confirmation.types';

@Injectable()
export class DbService {
  mockTransactions: DbApi<Transaction, MockTransactionRecord>;
  mockAddresses: DbApi<MockAddress, MockAddressRecord>;
  walletAddresses: DbApi<WalletAddress, WalletAddressRecord>;
  holdings: DbApi<HoldingBase, HoldingRecord>;
  holdingsSubmissions: DbApi<HoldingsSubmissionBase, HoldingsSubmissionsRecord>;
  fundingSubmissions: DbApi<FundingSubmissionBase, FundingSubmissionRecord>;
  exchanges: DbApi<ExchangeBase, ExchangeRecord>;
  registrations: DbApi<RegistrationTypes, RegistrationRecord>;
  approvals: DbApi<ApprovalBase, ApprovalRecord>;
  nodes: DbApi<NodeBase, NodeRecord>;
  users: DbApi<UserBase, UserRecord>;
  verifications: DbApi<VerificationBase, VerificationRecord>;
  submissionConfirmations: DbApi<SubmissionConfirmationBase, SubmissionConfirmationRecord>;

  constructor(
    private mongoService: MongoService,
    apiConfigService: ApiConfigService
  ) {
    const prefix = apiConfigService.isTestMode ? apiConfigService.nodeName : '';
    this.mockTransactions = new DbApi<Transaction, MockTransactionRecord>(mongoService, `mock-tx`);
    this.mockAddresses = new DbApi<MockAddress, MockAddressRecord>(mongoService, `mock-addresses`);
    this.walletAddresses = new DbApi<WalletAddress, WalletAddressRecord>(mongoService, `${prefix}wallet-addresses`);
    this.holdings = new DbApi<HoldingBase, HoldingRecord>(mongoService, `${prefix}holdings`);
    this.holdingsSubmissions = new DbApi<HoldingsSubmissionBase, HoldingsSubmissionsRecord>(mongoService, `${prefix}holdings-submissions`);
    this.fundingSubmissions = new DbApi<FundingSubmissionBase, FundingSubmissionRecord>(mongoService, `${prefix}funding-submissions`);
    this.exchanges = new DbApi<ExchangeBase, ExchangeRecord>(mongoService, `${prefix}exchanges`);
    this.registrations = new DbApi<RegistrationTypes, RegistrationRecord>(mongoService, `${prefix}registrations`);
    this.approvals = new DbApi<ApprovalBase, ApprovalRecord>(mongoService, `${prefix}approvals`);
    this.nodes = new DbApi<NodeBase, NodeRecord>(mongoService, `${prefix}nodes`);
    this.users = new DbApi<UserBase, UserRecord>(mongoService, `${prefix}users`);
    this.verifications = new DbApi<VerificationBase, VerificationRecord>(mongoService, `${prefix}verifications`);
    this.submissionConfirmations = new DbApi<SubmissionConfirmationBase, SubmissionConfirmationRecord>(mongoService, `${prefix}submission-confirmations`);
  }

  async reset() {
    await this.approvals.deleteMany({});
    await this.exchanges.deleteMany({});
    await this.fundingSubmissions.deleteMany({});
    await this.holdings.deleteMany({});
    await this.holdingsSubmissions.deleteMany({});
    await this.registrations.deleteMany({});
    await this.nodes.deleteMany({});
    await this.users.deleteMany({});
    await this.verifications.deleteMany({});
    await this.submissionConfirmations.deleteMany({});
    await this.walletAddresses.deleteMany({});
  }

  async close() {
    await this.mongoService.close();
  }

  async printStatus() {
    let status = '';
    status += await this.mockTransactions.printStatus() + '\n';
    status += await this.mockAddresses.printStatus() + '\n';
    status += await this.walletAddresses.printStatus() + '\n';
    status += await this.holdings.printStatus() + '\n';
    status += await this.fundingSubmissions.printStatus() + '\n';
    status += await this.exchanges.printStatus() + '\n';
    status += await this.registrations.printStatus() + '\n';
    status += await this.approvals.printStatus() + '\n';
    status += await this.nodes.printStatus() + '\n';
    status += await this.users.printStatus() + '\n';
    status += await this.verifications.printStatus() + '\n';
    status += await this.submissionConfirmations.printStatus() + '\n';
    return status;
  }
}
