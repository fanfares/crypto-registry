import { TestingModule } from '@nestjs/testing/testing-module';
import { DbService } from '../db/db.service';
import { RegistrationService } from '../registration/registration.service';
import { MockSendMailService } from '../mail-service';
import { MockMessageTransportService } from './mock-message-transport.service';
import { MessageSenderService } from './message-sender.service';
import { MessageReceiverService } from './message-receiver.service';
import { ApiConfigService } from '../api-config';
import { createTestDataFromModule, createTestModule } from '../testing';
import { SendMailService } from '../mail-service/send-mail-service';
import { MessageTransportService } from './message-transport.service';
import { SubmissionController, SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { BitcoinController } from '../crypto';
import { NetworkController } from './network.controller';
import { NodeService } from './node.service';
import { NodeDto } from '@bcr/types';

export class TestNode {

  static mockTransportService = new MockMessageTransportService();
  public dbService: DbService;
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

  constructor(
    public module: TestingModule
  ) {
    this.dbService = module.get<DbService>(DbService);
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
  }

  get address() {
    return this.apiConfigService.nodeAddress;
  }

  async getNodeDto() {
    return this.nodeService.getLocalNode()
  }

  async addNodes(nodes: TestNode[]) {
    const nodeDtos: NodeDto[] = []
    for (const node of nodes) {
      nodeDtos.push(await node.getNodeDto())
    }
    await this.dbService.nodes.insertMany(nodeDtos)
  }

  static async createTestNode(node: number): Promise<TestNode> {
    const module = await createTestModule(TestNode.mockTransportService, { nodeNumber: node });
    await createTestDataFromModule(module);
    const receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    TestNode.mockTransportService.addNode(apiConfigService.nodeAddress, receiverService);
    return new TestNode(module);
  }
}