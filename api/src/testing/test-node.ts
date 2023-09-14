import { TestingModule } from '@nestjs/testing/testing-module';
import { DbService } from '../db/db.service';
import { RegistrationService } from '../registration/registration.service';
import { MockSendMailService } from '../mail-service';
import { MockMessageTransportService } from '../network/mock-message-transport.service';
import { MessageSenderService } from '../network/message-sender.service';
import { MessageReceiverService } from '../network/message-receiver.service';
import { ApiConfigService } from '../api-config';
import { createTestModule, testCustomerEmail } from './index';
import { SendMailService } from '../mail-service/send-mail-service';
import { MessageTransportService } from '../network/message-transport.service';
import { AbstractSubmissionService, SubmissionController } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { BitcoinController, MockBitcoinService } from '../crypto';
import { NetworkController } from '../network/network.controller';
import { NodeService } from '../node';
import { Network, NodeBase, NodeRecord } from '@bcr/types';
import { VerificationController, VerificationService } from '../verification';
import { recordToBase } from '../utils/data/record-to-dto';
import { getHash } from '../utils';
import { Bip84Account } from '../crypto/bip84-account';
import { exchangeMnemonic } from '../crypto/exchange-mnemonic';
import { testExchangeName } from './test-exchange-name';
import { SyncService } from '../syncronisation/sync.service';
import { TestUtilsService } from './test-utils.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeController } from "../node/node.controller";

export interface TestSubmissionOptions {
  sendPayment?: boolean;
  additionalSubmissionCycles?: number;
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
  public submissionService: AbstractSubmissionService;
  public submissionController: SubmissionController;
  public walletService: WalletService;
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
    this.registrationService = module.get<RegistrationService>(RegistrationService);
    this.sendMailService = module.get<SendMailService>(SendMailService) as MockSendMailService;
    this.transportService = module.get<MessageTransportService>(MessageTransportService);
    this.receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    this.senderService = module.get<MessageSenderService>(MessageSenderService);
    this.apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    this.submissionService = module.get<AbstractSubmissionService>(AbstractSubmissionService);
    this.submissionController = module.get<SubmissionController>(SubmissionController);
    this.walletService = module.get<WalletService>(WalletService);
    this.bitcoinController = module.get<BitcoinController>(BitcoinController);
    const bitcoinServiceFactory = module.get<BitcoinServiceFactory>(BitcoinServiceFactory);
    this.bitcoinService = bitcoinServiceFactory.getService(Network.testnet) as MockBitcoinService
    this.networkController = module.get<NetworkController>(NetworkController);
    this.nodeController = module.get<NodeController>(NodeController);
    this.nodeService = module.get<NodeService>(NodeService);
    this.verificationService = module.get<VerificationService>(VerificationService);
    this.verificationController = module.get<VerificationController>(VerificationController);
    this.synchronisationService = module.get<SyncService>(SyncService)
    this.testUtilsService = module.get<TestUtilsService>(TestUtilsService)
  }

  get address() {
    return this.apiConfigService.nodeAddress;
  }

  setBitcoinNextRequestStatusCode(code: number) {
    this.bitcoinService.setNextRequestStatusCode(code)
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
    useStartMode?: boolean,
    singleNode?: boolean
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
    if (!options?.useStartMode) {
      await node.setStartupComplete()
    }
    return node;
  }

  async createTestSubmission(): Promise<string> {
    const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
    const submissionId = await this.submissionService.createSubmission({
      receiverAddress: this.apiConfigService.nodeAddress,
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

    // This will retrieve the wallet balance
    await this.submissionService.executionCycle()

    return submissionId;
  }

  async reset(autoStart: boolean) {
    await this.db.reset();
    await this.testUtilsService.resetNode({
      resetAll: true,
      autoStart: autoStart
    });
    this.sendMailService.reset();
  }

  async destroy() {
    await this.module.close();
  }

  async isLeader() {
    return (await this.nodeService.getThisNode()).isLeader
  }

  async setStartupComplete() {
    await this.nodeService.setStartupComplete()
  }
}
