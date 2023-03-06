import { createTestDataFromModule, createTestModule, testCustomerEmail } from '../testing';
import { VerificationController } from './verification-controller';
import { TestingModule } from '@nestjs/testing';
import { MessageType, Network, VerificationRequestDto } from '@bcr/types';
import { DbService } from '../db/db.service';
import { MockMessageTransportService } from '../network/mock-message-transport.service';
import { MessageTransportService } from '../network/message-transport.service';
import { MockMessageReceiverService } from '../network/mock-message-receiver-service';
import { SendMailService } from '../mail-service/send-mail-service';
import { MockSendMailService } from '../mail-service';
import { ApiConfigService } from '../api-config';

describe('verification-controller', () => {
  let controller: VerificationController;
  let module: TestingModule;
  let dbService: DbService;
  let mockMessageTransportService: MockMessageTransportService;
  let mockMessageReceiver: MockMessageReceiverService;
  let mockSendMailService: MockSendMailService;
  let apiConfigService: ApiConfigService

  beforeEach(async () => {
    module = await createTestModule(new MockMessageTransportService());
    await createTestDataFromModule(module, {
      createSubmission: true,
      completeSubmission: true
    });
    controller = module.get<VerificationController>(VerificationController);
    dbService = module.get<DbService>(DbService);
    mockMessageTransportService = module.get<MessageTransportService>(MessageTransportService) as MockMessageTransportService;
    mockSendMailService = module.get<SendMailService>(SendMailService) as MockSendMailService;
    apiConfigService = module.get<ApiConfigService>(ApiConfigService) ;
  })

  test('never send to local address when connected to network', async () => {

    await dbService.nodes.insert({
      address: 'https://address/',
      ownerEmail: 'ano@ano.com',
      unresponsive: false,
      publicKey: 'public key',
      nodeName: 'test',
      lastSeen: new Date()
    })

    mockMessageReceiver = new MockMessageReceiverService()
    mockMessageTransportService.addNode('https://address/', mockMessageReceiver)

    const {  selectedEmailNode } = await controller.verify({
      email: testCustomerEmail,
    })
    expect( selectedEmailNode ).toBe('test');
    expect(mockMessageReceiver.message.type).toBe(MessageType.verify);
    const data: VerificationRequestDto = JSON.parse(mockMessageReceiver.message.data)
    expect(data.email).toBe(testCustomerEmail);
    expect(mockSendMailService.lastSentMail).toBeUndefined();
  })

  test('send to local address when disconnected from network', async () => {
    const {  selectedEmailNode } = await controller.verify({
      email: testCustomerEmail,
    })
    expect( selectedEmailNode ).toBe(apiConfigService.nodeName);
    expect(mockSendMailService.lastSentMail).toBeDefined();
  })
})
