import { TestingModule } from '@nestjs/testing/testing-module';
import { DbService } from '../db/db.service';
import { RegistrationService } from '../registration/registration.service';
import { MockSendMailService } from '../mail-service';
import { MockMessageTransportService } from '../network/mock-message-transport.service';
import { MessageSenderService } from '../network/message-sender.service';
import { MessageReceiverService } from '../network/message-receiver.service';
import { ApiConfigService } from '../api-config';
import { createTestModule, TEST_CUSTOMER_EMAIL } from './index';
import { SendMailService } from '../mail-service/send-mail-service';
import { MessageTransportService } from '../network/message-transport.service';
import { WalletService } from '../crypto/wallet.service';
import { BitcoinController, MockBitcoinService } from '../crypto';
import { NetworkController } from '../network/network.controller';
import { NodeService } from '../node';
import { Network, NodeBase, NodeRecord } from '@bcr/types';
import { VerificationController, VerificationService } from '../verification';
import { recordToBase } from '../utils/data/record-to-dto';
import { Bip84Utils } from '../crypto/bip84-utils';
import { exchangeMnemonic } from '../crypto/exchange-mnemonic';
import { TEST_EXCHANGE_NAME } from './test-exchange-name';
import { SyncService } from '../syncronisation/sync.service';
import { TestUtilsService } from './test-utils.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeController } from '../node/node.controller';
import { MockWalletService } from '../crypto/mock-wallet.service';
import { getSigningMessage } from '../crypto/get-signing-message';
import { ExchangeService } from '../exchange/exchange.service';
import { getHash } from '../utils';
import { HoldingsSubmissionService } from '../holdings-submission';
import { FundingSubmissionService } from '../funding-submission';

export interface TestSubmissionOptions {
  additionalSubmissionCycles?: number;
}

export class TestNode {

  static mockTransportService = new MockMessageTransportService();
  public db: DbService;
  public exchangeService: ExchangeService;
  public registrationService: RegistrationService;
  public sendMailService: MockSendMailService;
  public transportService: MessageTransportService;
  public senderService: MessageSenderService;
  public receiverService: MessageReceiverService;
  public apiConfigService: ApiConfigService;
  public fundingSubmissionService: FundingSubmissionService;
  public holdingsSubmissionService: HoldingsSubmissionService;
  public walletService: MockWalletService;
  public bitcoinService: MockBitcoinService;
  public bitcoinController: BitcoinController;
  public networkController: NetworkController;
  public nodeController: NodeController;
  public nodeService: NodeService;
  public verificationService: VerificationService;
  public verificationController: VerificationController;
  public synchronisationService: SyncService;
  public testUtilsService: TestUtilsService;
  public nodeNumber: number;

  constructor(
    public module: TestingModule,
    nodeNumber: number
  ) {
    this.nodeNumber = nodeNumber;
    this.db = module.get<DbService>(DbService);
    this.exchangeService = module.get<ExchangeService>(ExchangeService);
    this.registrationService = module.get<RegistrationService>(RegistrationService);
    this.sendMailService = module.get<SendMailService>(SendMailService) as MockSendMailService;
    this.transportService = module.get<MessageTransportService>(MessageTransportService);
    this.receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    this.senderService = module.get<MessageSenderService>(MessageSenderService);
    this.apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    this.fundingSubmissionService = module.get<FundingSubmissionService>(FundingSubmissionService);
    this.holdingsSubmissionService = module.get<HoldingsSubmissionService>(HoldingsSubmissionService);
    this.walletService = module.get<WalletService>(WalletService) as MockWalletService;
    this.bitcoinController = module.get<BitcoinController>(BitcoinController);
    const bitcoinServiceFactory = module.get<BitcoinServiceFactory>(BitcoinServiceFactory);
    this.bitcoinService = bitcoinServiceFactory.getService(Network.testnet) as MockBitcoinService;
    this.networkController = module.get<NetworkController>(NetworkController);
    this.nodeController = module.get<NodeController>(NodeController);
    this.nodeService = module.get<NodeService>(NodeService);
    this.verificationService = module.get<VerificationService>(VerificationService);
    this.verificationController = module.get<VerificationController>(VerificationController);
    this.synchronisationService = module.get<SyncService>(SyncService);
    this.testUtilsService = module.get<TestUtilsService>(TestUtilsService);
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

  static async createTestNode(nodeNumber: number, options?: {
    singleNode?: boolean,
    resetMockWallet?: boolean
  }): Promise<TestNode> {
    const module = await createTestModule(TestNode.mockTransportService, nodeNumber, options?.singleNode ?? false);
    const testUtilsService = module.get<TestUtilsService>(TestUtilsService);
    await testUtilsService.resetNode({
      resetAll: true
    });
    const receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    TestNode.mockTransportService.addNode(apiConfigService.nodeAddress, receiverService);
    const node = new TestNode(module, nodeNumber);
    if (options?.resetMockWallet) {
      await node.walletService.reset();
    }
    return node;
  }

  async getTestUserId(): Promise<string> {
    const testUser = await this.db.users.findOne({
      email: TEST_CUSTOMER_EMAIL
    });

    if (!testUser) {
      return await this.db.users.insert({
        email: TEST_CUSTOMER_EMAIL,
        isVerified: true,
        isSystemAdmin: false,
        exchangeId: await this.getTestExchangeId()
      });
    }
    return testUser._id;
  }

  async getTestExchangeId(): Promise<string> {
    const testExchange = await this.db.exchanges.findOne({
      name: TEST_EXCHANGE_NAME
    });

    if (!testExchange) {
      const exchange = await this.exchangeService.createExchange(TEST_EXCHANGE_NAME);
      return exchange._id;
    }
    return testExchange._id;
  }

  async createTestFundingSubmission(): Promise<string> {
    const bip42Utils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet);
    const address = bip42Utils.getAddress(0, false);
    const message = getSigningMessage();
    const signedAddress = bip42Utils.sign(0, false, message);
    const testExchangeId = await this.getTestExchangeId();

    return await this.fundingSubmissionService.createSubmission(testExchangeId, [{
      address,
      signature: signedAddress.signature
    }], message);
  }

  async createTestHoldingsSubmission() {
    const testExchangeId = await this.getTestExchangeId();

    return await this.holdingsSubmissionService.createSubmission(
      testExchangeId, [{
        hashedEmail: getHash('customer-2@mail.com', this.apiConfigService.hashingAlgorithm),
        amount: 20000000
      }, {
        hashedEmail: getHash(TEST_CUSTOMER_EMAIL, this.apiConfigService.hashingAlgorithm),
        amount: 10000000
      }]);
  }

  async reset() {
    await this.db.reset();
    await this.testUtilsService.resetNode({
      resetAll: true
    });
    this.sendMailService.reset();
  }

  async destroy() {
    await this.module.close();
  }

  async isLeader() {
    return (await this.nodeService.getThisNode()).isLeader;
  }
}
