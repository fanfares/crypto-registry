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

export class TestNode {

  static mockTransportService = new MockMessageTransportService();

  address: string;
  module: TestingModule;
  dbService: DbService;
  registrationService: RegistrationService;
  sendMailService: MockSendMailService;
  transportService: MessageTransportService;
  senderService: MessageSenderService;
  receiverService: MessageReceiverService;
  apiConfigService: ApiConfigService;
  submissionService: SubmissionService;
  submissionController: SubmissionController;
  walletService: WalletService;
  bitcoinController: BitcoinController;
  networkController: NetworkController;
  nodeService: NodeService

  static async createTestNode(node: number): Promise<TestNode> {
    const module = await createTestModule(TestNode.mockTransportService, { nodeNumber: node });
    await createTestDataFromModule(module);
    const receiverService = module.get<MessageReceiverService>(MessageReceiverService);
    const apiConfigService = module.get<ApiConfigService>(ApiConfigService)
    TestNode.mockTransportService.addNode(apiConfigService.nodeAddress, receiverService);
    const dbService = module.get<DbService>(DbService);
    const senderService = module.get<MessageSenderService>(MessageSenderService)
    return {
      address: apiConfigService.nodeAddress,
      module: module,
      dbService: dbService,
      registrationService: module.get<RegistrationService>(RegistrationService),
      sendMailService: module.get<SendMailService>(SendMailService) as MockSendMailService,
      transportService: module.get<MessageTransportService>(MessageTransportService) as MockMessageTransportService,
      receiverService: receiverService,
      senderService: senderService,
      apiConfigService: apiConfigService,
      submissionService: module.get<SubmissionService>(SubmissionService),
      submissionController: module.get<SubmissionController>(SubmissionController),
      walletService: module.get<WalletService>(WalletService),
      bitcoinController: module.get<BitcoinController>(BitcoinController),
      networkController: module.get<NetworkController>(NetworkController),
      nodeService: module.get<NodeService>(NodeService)
    };
  }
}
