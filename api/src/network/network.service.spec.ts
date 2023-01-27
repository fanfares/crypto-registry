import { MessageSenderService } from './message-sender.service';
import { ApiConfigService } from '../api-config';
import { MockMessageTransportService } from './mock-message-transport.service';
import { Message, MessageType } from '@bcr/types';
import { DbService } from '../db/db.service';
import { MongoService } from '../db';
import { Logger } from '@nestjs/common';
import { MessageReceiverService } from './message-receiver.service';
import { SubmissionService } from '../submission';
import { MockEventGateway } from './mock-event-gateway';

export interface TestNode {
  dbService: DbService;
  messageSenderService: MessageSenderService;
  messageReceiverService: MessageReceiverService;
}

describe('network-service', () => {
  let node1: TestNode;
  let node2: TestNode;
  let node3: TestNode;

  const address1 = 'node-1';
  const address2 = 'node-2';
  const address3 = 'node-3';

  let mockMessageTransportService: MockMessageTransportService;

  beforeEach(async () => {
    mockMessageTransportService = new MockMessageTransportService();
    const logger = new Logger();
    const eventGateway = new MockEventGateway();
    const submissionService = new SubmissionService(null, null, null, null);

    async function createTestNode(name: string): Promise<TestNode> {
      const config: ApiConfigService = {
        dbUrl: process.env.MONGO_URL + name,
        p2pLocalAddress: name,
        p2pNetworkAddress: name === address1 ? null : address1,
        nodeName: name
      } as ApiConfigService;

      const mongoService = new MongoService(config);
      await mongoService.connect();
      const dbService = new DbService(mongoService);
      const messageSenderService = new MessageSenderService(config, mockMessageTransportService, logger, dbService, eventGateway);
      const messageReceiverService = new MessageReceiverService(config, logger, dbService, submissionService, eventGateway, messageSenderService);
      mockMessageTransportService.addNode(name, messageReceiverService);
      await messageSenderService.reset();
      return { messageSenderService, messageReceiverService, dbService };
    }

    node1 = await createTestNode(address1);
    node2 = await createTestNode(address2);
    node3 = await createTestNode(address3);
  });

  test('defaults', async () => {
    expect((await node1.messageSenderService.getNodeDtos()).length).toBe(1);
  });

  test('connect 2 nodes', async () => {
    await node2.messageSenderService.requestToJoin();
    const node1Dtos = await node1.messageSenderService.getNodeDtos();
    const node2Dtos = await node2.messageSenderService.getNodeDtos();
    expect(node1Dtos.length).toEqual(2);
    expect(node2Dtos.length).toEqual(2);

    expect(node1Dtos).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'node-2',
          address: address2,
          isLocal: false
        }),
        expect.objectContaining({
          name: 'node-1',
          address: address1,
          isLocal: true
        })
      ]));

    expect(node2Dtos).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'node-2',
          address: address2,
          isLocal: true
        }), expect.objectContaining({
          name: 'node-1',
          address: address1,
          isLocal: false
        })
      ]));

    expect(await node1.dbService.messages.count({})).toBe(3);
    expect(await node2.dbService.messages.count({})).toBe(2);
  });

  test('connect 3 nodes', async () => {
    await node2.messageSenderService.requestToJoin();
    await node3.messageSenderService.requestToJoin();

    const node1Dtos = await node1.messageSenderService.getNodeDtos();
    const node2Dtos = await node2.messageSenderService.getNodeDtos();

    expect(node1Dtos.length).toEqual(3);
    expect(node2Dtos.length).toEqual(3);

    expect(node1Dtos).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'node-2',
          address: address2,
          isLocal: false
        }),
        expect.objectContaining({
          name: 'node-1',
          address: address1,
          isLocal: true
        }),
        expect.objectContaining({
          name: 'node-3',
          address: address3,
          isLocal: false
        })
      ]));

    expect(node2Dtos).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'node-2',
        address: address2,
        isLocal: true
      }),
      expect.objectContaining({
        name: 'node-1',
        address: address1,
        isLocal: false
      }),
      expect.objectContaining({
        name: 'node-3',
        address: address3,
        isLocal: false
      })
    ]));
  });

  test('broadcast text message', async () => {
    await node2.messageSenderService.requestToJoin();
    await node3.messageSenderService.requestToJoin();
    const message = Message.createMessage(MessageType.textMessage, 'node-1', 'node-1', 'Hello World');
    await node1.messageSenderService.sendBroadcastMessage(message);
    const nodes = [node1, node2, node3];
    for (const node of nodes) {
      const receivedMessage = (await node.messageSenderService.getMessageDtos()).find(m => m.id === message.id);
      expect(receivedMessage.data).toEqual('Hello World');
    }
  });
});
