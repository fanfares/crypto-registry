import { createTestDataFromModule, createTestModule } from '../testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { DbService } from '../db/db.service';
import { RegistrationService } from './registration.service';
import { ApprovalStatus } from '../types/registration.types';
import { MockSendMailService } from '../mail-service';
import { getTokenFromLink } from '../utils/get-token-from-link';
import { SendMailService } from '../mail-service/send-mail-service';
import { MockMessageTransportService } from '../network/mock-message-transport.service';
import { MessageTransportService } from '../network/message-transport.service';
import { MessageReceiverService } from '../network/message-receiver.service';
import { ApiConfigService } from '../api-config';
import { MessageSenderService } from '../network/message-sender.service';
import { MessageType } from '@bcr/types';

interface ModuleServices {
  module: TestingModule
  dbService: DbService,
  registrationService: RegistrationService,
  sendMailService: MockSendMailService,
  transportService: MockMessageTransportService,
  senderService: MessageSenderService,
  receiverService: MessageReceiverService
  apiConfigService: ApiConfigService;
}

const createTestNode = async (node: number): Promise<ModuleServices> => {
  const module = await createTestModule({ node });
  await createTestDataFromModule(module);
  return {
    module: module,
    dbService: module.get<DbService>(DbService),
    registrationService: module.get<RegistrationService>(RegistrationService),
    sendMailService: module.get<SendMailService>(SendMailService) as any as MockSendMailService,
    transportService: module.get<MessageTransportService>(MessageTransportService) as any as MockMessageTransportService,
    receiverService: module.get<MessageReceiverService>(MessageReceiverService),
    senderService: module.get<MessageSenderService>(MessageSenderService),
    apiConfigService: module.get<ApiConfigService>(ApiConfigService)
  };
};

describe('registration-service', () => {
  let module1: ModuleServices;
  let module2: ModuleServices;

  beforeEach(async () => {
    module1 = await createTestNode(1);
    module2 = await createTestNode(2);

    module1.transportService.addNode('http://node-2/', module2.receiverService);
    module2.transportService.addNode('http://node-1/', module1.receiverService);
  });

  afterEach(async () => {
    await module1.module.close();
    await module2.module.close();
  });

  test('registration workflow', async () => {

    // First the new entrant registers on another node on the network
    await module1.registrationService.sendRegistration({
      email: 'head@ftx.com',
      institutionName: 'FTX',
      toNodeAddress: 'http://node-2/'
    });

    let registration = await module2.dbService.registrations.findOne({ email: 'head@ftx.com' });
    expect(registration.status).toBe(ApprovalStatus.pendingInitiation);

    // Registrant verifies their email on that node.
    // This triggers approval emails to be sent the owner of the local node
    const verificationToken = getTokenFromLink(module2.sendMailService.link);
    await module2.registrationService.verifyEmail(verificationToken);

    // Initiate the approvals
    await module2.registrationService.initiateApprovals(verificationToken);

    // Registration is recorded on node-2
    registration = await module2.dbService.registrations.findOne({ email: 'head@ftx.com' });
    expect(registration.status).toBe(ApprovalStatus.pendingApproval);

    // Expect 1 approval to be required
    expect(await module2.dbService.approvals.count({})).toBe(1);

    // Registering Nodes owner receives an email to approve/reject
    await module2.registrationService.approve(getTokenFromLink(module2.sendMailService.link), true);

    // Registration is approved.
    registration = await module2.dbService.registrations.findOne({ email: 'head@ftx.com' });
    expect(registration.status).toBe(ApprovalStatus.approved);

    const registrationStatusDto = await module2.registrationService.getRegistrationStatus(verificationToken);
    expect(registrationStatusDto.approvals.length).toBe(1);
    expect(registrationStatusDto.approvals[0].email).toBe(module2.apiConfigService.email.fromEmail);
    expect(registrationStatusDto.approvals[0].status).toBe(ApprovalStatus.approved);

    // Registering node should be visible in registered node
    expect(await module1.dbService.nodes.findOne({ nodeName: 'node-2' })).toBeDefined();
    expect(await module1.dbService.nodes.findOne({ nodeName: 'node-1' })).toBeDefined();

    // Registering node should be visible in registered node
    expect(await module2.dbService.nodes.findOne({ nodeName: 'node-2' })).toBeDefined();
    expect(await module2.dbService.nodes.findOne({ nodeName: 'node-1' })).toBeDefined();

    // Broadcast a text message
    const message = await module2.senderService.sendBroadcastMessage(MessageType.textMessage, 'Hello World');
    const receivedMessage = await module1.dbService.messages.findOne({ id: message.id });
    expect(receivedMessage.data).toBe('Hello World');
  });

});
