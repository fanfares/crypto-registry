import { TestingModule } from '@nestjs/testing/testing-module';
import { DbService } from '../db/db.service';
import { RegistrationService } from '../registration/registration.service';
import { MailService, MockMailService } from '../mail-service';
import { MockMessageTransportService } from '../network/mock-message-transport.service';
import { MessageSenderService } from '../network/message-sender.service';
import { MessageReceiverService } from '../network/message-receiver.service';
import { ApiConfigService } from '../api-config';
import { createTestModule } from './create-test-module';
import { TEST_CUSTOMER_EMAIL } from './test-customer-email';
import { MessageTransportService } from '../network/message-transport.service';
import { MockWalletService, WalletService } from '../bitcoin-service';
import { BitcoinController } from '../bitcoin-service/bitcoin-controller';
import { NetworkController } from '../network/network.controller';
import { NodeService } from '../node';
import { CustomerHoldingDto, Network, NodeBase, NodeRecord, ResetDataOptions } from '@bcr/types';
import { VerificationController, VerificationService } from '../verification';
import { recordToBase } from '../utils/data/record-to-dto';
import { Bip84Utils, exchangeMnemonic } from '../crypto';
import { TEST_EXCHANGE_NAME } from './test-exchange-name';
import { SyncService } from '../syncronisation/sync.service';
// import { TestUtilsService } from './test-utils.service';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { NodeController } from '../node/node.controller';
import { ExchangeService } from '../exchange/exchange.service';
import { getHash } from '../utils';
import { HoldingsSubmissionService } from '../customer-holdings';
import { FundingAddressService, FundingSubmissionService } from '../funding';
import { MockBitcoinService } from '../bitcoin-service/mock-bitcoin.service';
import { BitCoinCoreApi } from '../bitcoin-core-api/bitcoin-core-api';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';
import { createTestData } from './create-test-data';
import { ResetNetworkOptionsDto } from '../types/reset-network-options-dto.type';

export interface TestSubmissionOptions {
  additionalSubmissionCycles?: number;
}

export class TestNode {

  static mockTransportService = new MockMessageTransportService();
  public db: DbService;
  public exchangeService: ExchangeService;
  public registrationService: RegistrationService;
  public mockMailService: MockMailService;
  public transportService: MessageTransportService;
  public senderService: MessageSenderService;
  public receiverService: MessageReceiverService;
  public apiConfigService: ApiConfigService;
  public fundingSubmissionService: FundingSubmissionService;
  public fundingAddressService: FundingAddressService;
  public holdingsSubmissionService: HoldingsSubmissionService;
  public walletService: MockWalletService;
  public bitcoinService: MockBitcoinService;
  public bitcoinCoreApi: BitCoinCoreApi;
  public bitcoinController: BitcoinController;
  public networkController: NetworkController;
  public nodeController: NodeController;
  public nodeService: NodeService;
  public verificationService: VerificationService;
  public verificationController: VerificationController;
  public synchronisationService: SyncService;
  // public testUtilsService: TestUtilsService;
  public nodeNumber: number;

  constructor(
    public module: TestingModule,
    nodeNumber: number
  ) {
    this.nodeNumber = nodeNumber;
    this.db = module.get<DbService>(DbService);
    this.exchangeService = module.get<ExchangeService>(ExchangeService);
    this.registrationService = module.get<RegistrationService>(RegistrationService);
    this.mockMailService = module.get<MailService>(MailService) as MockMailService;
    this.transportService = module.get<MessageTransportService>(MessageTransportService);
    this.receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    this.senderService = module.get<MessageSenderService>(MessageSenderService);
    this.apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    this.fundingSubmissionService = module.get<FundingSubmissionService>(FundingSubmissionService);
    this.fundingAddressService = module.get<FundingAddressService>(FundingAddressService);
    this.holdingsSubmissionService = module.get<HoldingsSubmissionService>(HoldingsSubmissionService);
    this.walletService = module.get<WalletService>(WalletService) as MockWalletService;
    this.bitcoinController = module.get<BitcoinController>(BitcoinController);
    const bitcoinServiceFactory = module.get<BitcoinServiceFactory>(BitcoinServiceFactory);
    this.bitcoinService = bitcoinServiceFactory.getService(Network.testnet) as MockBitcoinService;
    const bitcoinCoreApiFactory = module.get<BitcoinCoreApiFactory>(BitcoinCoreApiFactory);
    this.bitcoinCoreApi = bitcoinCoreApiFactory.getApi(Network.testnet);
    this.networkController = module.get<NetworkController>(NetworkController);
    this.nodeController = module.get<NodeController>(NodeController);
    this.nodeService = module.get<NodeService>(NodeService);
    this.verificationService = module.get<VerificationService>(VerificationService);
    this.verificationController = module.get<VerificationController>(VerificationController);
    this.synchronisationService = module.get<SyncService>(SyncService);
    // this.testUtilsService = module.get<TestUtilsService>(TestUtilsService);
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
    useRealBitcoinService?: boolean
  }): Promise<TestNode> {
    const module = await createTestModule(TestNode.mockTransportService, nodeNumber, {
      singleNode: options?.singleNode ?? false,
      useRealBitcoinServices: options?.useRealBitcoinService ?? false
    });
    const receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    TestNode.mockTransportService.addNode(apiConfigService.nodeAddress, receiverService);
    const node = new TestNode(module, nodeNumber);
    await node.nodeService.startUp();
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

  async createTestFundingSubmission(
    resetFunding: boolean,
    addressIndex: number,
    options?: {
      network: Network
    }
  ) {
    const network = options?.network ?? Network.testnet;
    const prefix = network === Network.testnet ? 'vprv' : 'zprv';
    const exchangeUtils = Bip84Utils.fromMnemonic(exchangeMnemonic, network, prefix);
    const address = exchangeUtils.getAddress(addressIndex, false);
    const message = await this.bitcoinCoreApi.getBestBlockHash();
    const signedAddress = exchangeUtils.sign(addressIndex, false, message);
    const exchangeId = await this.getTestExchangeId();

    if (addressIndex > 0) {
      await this.walletService.sendFunds(address, addressIndex * 10000);
    } else {
      await this.walletService.sendFunds(address, 30000000);
    }

    const fundingSubmissionId = await this.fundingSubmissionService.createSubmission(exchangeId, {
      resetFunding: resetFunding,
      addresses: [{
        address,
        signature: signedAddress.signature,
        message: message
      }]
    });

    return {
      exchangeId, fundingSubmissionId, signedAddress, message, address
    };
  }

  async createTestHoldingsSubmission(options?: {
    exchangeUid?: string
    amount?: number
  }) {
    const testExchangeId = await this.getTestExchangeId();

    let holding: CustomerHoldingDto = {
      hashedEmail: getHash(TEST_CUSTOMER_EMAIL, this.apiConfigService.hashingAlgorithm),
      amount: options?.amount ?? 10000000
    };

    if (options?.exchangeUid) {
      holding = {
        amount: options?.amount ?? 10000000,
        exchangeUid: options.exchangeUid
      };
    }

    return await this.holdingsSubmissionService.createSubmission(
      testExchangeId, [holding, {
        hashedEmail: getHash('customer-2@mail.com', this.apiConfigService.hashingAlgorithm),
        amount: 20000000
      }]);
  }

  async reset(options?: ResetDataOptions) {
    this.mockMailService.reset();
    await createTestData(this.db, this.bitcoinService, this.walletService, this.exchangeService, options);
    await this.nodeService.startUp();
  }

  async resetNetwork(networkOptions: ResetNetworkOptionsDto, dataOptions?: ResetDataOptions) {
    this.mockMailService.reset();
    await createTestData(this.db, this.bitcoinService, this.walletService, this.exchangeService, dataOptions);
    await this.nodeService.startUp();
  }

  async destroy() {
    await this.module.close();
  }

  async isLeader() {
    return (await this.nodeService.getThisNode()).isLeader;
  }
}
