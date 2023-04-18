import { TestingModule } from '@nestjs/testing/testing-module';
import { DbService } from '../db/db.service';
import { RegistrationService } from '../registration/registration.service';
import { MockSendMailService } from '../mail-service';
import { MockMessageTransportService } from './mock-message-transport.service';
import { MessageSenderService } from './message-sender.service';
import { MessageReceiverService } from './message-receiver.service';
import { ApiConfigService } from '../api-config';
import { createTestModule, resetModule, testCustomerEmail } from '../testing';
import { SendMailService } from '../mail-service/send-mail-service';
import { MessageTransportService } from './message-transport.service';
import { SubmissionController, SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { BitcoinController } from '../crypto';
import { NetworkController } from './network.controller';
import { NodeService } from '../node';
import { NodeBase, NodeRecord } from '@bcr/types';
import { VerificationController, VerificationService } from '../verification';
import { recordToBase } from '../utils/data/record-to-dto';
import { getHash } from '../utils';
import { Bip84Account } from '../crypto/bip84-account';
import { exchangeMnemonic } from '../crypto/exchange-mnemonic';
import { testExchangeName } from '../testing/test-exchange-name';

export interface TestSubmissionOptions {
  completeSubmission?: boolean;
}

export class TestNode {

  static mockTransportService = new MockMessageTransportService();
  public db: DbService;
  public registrationService: RegistrationService;
  public sendMailService: MockSendMailService;
  public transportService: MessageTransportService;
  public senderService: MessageSenderService;
  public receiverService: MessageReceiverService;
  public apiConfigService: ApiConfigService;
  public submissionService: SubmissionService;
  public submissionController: SubmissionController;
  public walletService: WalletService;
  public bitcoinController: BitcoinController;
  public networkController: NetworkController;
  public nodeService: NodeService;
  public verificationService: VerificationService;
  public verificationController: VerificationController;
  public nodeNumber: number;

  constructor(
    public module: TestingModule,
    nodeNumber: number
  ) {
    this.nodeNumber = nodeNumber;
    this.db = module.get<DbService>(DbService);
    this.registrationService = module.get<RegistrationService>(RegistrationService);
    this.sendMailService = module.get<SendMailService>(SendMailService) as MockSendMailService;
    this.transportService = module.get<MessageTransportService>(MessageTransportService);
    this.receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    this.senderService = module.get<MessageSenderService>(MessageSenderService);
    this.apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    this.submissionService = module.get<SubmissionService>(SubmissionService);
    this.submissionController = module.get<SubmissionController>(SubmissionController);
    this.walletService = module.get<WalletService>(WalletService);
    this.bitcoinController = module.get<BitcoinController>(BitcoinController);
    this.networkController = module.get<NetworkController>(NetworkController);
    this.nodeService = module.get<NodeService>(NodeService);
    this.verificationService = module.get<VerificationService>(VerificationService);
    this.verificationController = module.get<VerificationController>(VerificationController);
  }

  get address() {
    return this.apiConfigService.nodeAddress;
  }

  async printStatus() {
    let status = 'Status Report:' + this.apiConfigService.nodeAddress + '\n';
    status += await this.db.printStatus();
    console.log(status);
  }

  async addNodes(nodes: TestNode[]) {
    const nodeDtos: NodeBase[] = [];
    for (const node of nodes) {
      const thisNode = await node.nodeService.getThisNode();
      if (thisNode.address !== this.apiConfigService.nodeAddress) {
        const thisNodeBase = recordToBase<NodeBase, NodeRecord>(thisNode);
        nodeDtos.push(thisNodeBase);
      }
    }
    await this.db.nodes.insertMany(nodeDtos);
  }

  async setLeader(address: string) {
    await this.db.nodes.findOneAndUpdate({
      address: address
    }, {
      isLeader: true,
      leaderVote: address
    });

    await this.db.nodes.updateMany({
      address: {$ne: address}
    }, {
      isLeader: false,
      leaderVote: address
    });
  }

  static async createTestNode(nodeNumber: number): Promise<TestNode> {
    const module = await createTestModule(TestNode.mockTransportService, nodeNumber);
    await resetModule(module);
    const receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    TestNode.mockTransportService.addNode(apiConfigService.nodeAddress, receiverService);
    return new TestNode(module, nodeNumber);
  }

  async createTestSubmission(
    options?: TestSubmissionOptions
  ): Promise<string> {
    const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
    const submissionId = await this.submissionService.createSubmission({
      initialNodeAddress: this.apiConfigService.nodeAddress,
      exchangeZpub: exchangeZpub,
      exchangeName: testExchangeName,
      customerHoldings: [{
        hashedEmail: getHash(testCustomerEmail, this.apiConfigService.hashingAlgorithm),
        amount: 10000000
      }, {
        hashedEmail: getHash('customer-2@mail.com', this.apiConfigService.hashingAlgorithm),
        amount: 20000000
      }]
    });

    if (options?.completeSubmission) {
      const submission = await this.db.submissions.get(submissionId);
      await this.walletService.sendFunds(exchangeZpub, submission.paymentAddress, submission.paymentAmount);
      await this.submissionService.waitForSubmissionsForPayment();
    }

    return submissionId;
  }

  async reset() {
    await this.db.reset();
    await resetModule(this.module);
    this.sendMailService.reset();
  }

  async destroy() {
    await this.module.close();
  }
}
