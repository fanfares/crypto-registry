import { P2pService } from './p2p.service';
import { ApiConfigService } from '../api-config';
import { MockMessageSenderService } from './mock-message-sender.service';
import { Message, MessageType } from '@bcr/types';
import { DbService } from '../db/db.service';
import { MongoService } from '../db';
import { Logger } from '@nestjs/common';

export interface TestNode {
  dbService: DbService;
  p2pService: P2pService;
}

describe('p2p-service', () => {
  let node1: TestNode;
  let node2: TestNode;
  let node3: TestNode;

  const address1 = 'node-1';
  const address2 = 'node-2';
  const address3 = 'node-3';

  let messageSender: MockMessageSenderService;

  beforeEach(async () => {
    messageSender = new MockMessageSenderService();
    const logger = new Logger();

    async function createTestNode(name: string): Promise<TestNode> {
      const mongoService = new MongoService({
        dbUrl: process.env.MONGO_URL + name
      } as ApiConfigService);
      await mongoService.connect();
      const dbService = new DbService(mongoService);
      const p2pService = new P2pService({
          p2pLocalAddress: name,
          p2pNetworkAddress: name === address1 ? null : address1,
          nodeName: name
        } as ApiConfigService,
        messageSender, logger, dbService);
      await p2pService.reset();
      messageSender.addNode(p2pService);
      return { p2pService, dbService };
    }

    node1 = await createTestNode(address1);
    node2 = await createTestNode(address2);
    node3 = await createTestNode(address3);
  });

  test('defaults', async () => {
    expect((await node1.p2pService.getNodeDtos()).length).toBe(1);
  });

  test('connect 2 nodes', async () => {
    await node2.p2pService.requestToJoin();
    const node1Dtos = await node1.p2pService.getNodeDtos();
    const node2Dtos = await node2.p2pService.getNodeDtos();
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
    await node2.p2pService.requestToJoin();
    await node3.p2pService.requestToJoin();

    const node1Dtos = await node1.p2pService.getNodeDtos();
    const node2Dtos = await node2.p2pService.getNodeDtos();

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
    await node2.p2pService.requestToJoin();
    await node3.p2pService.requestToJoin();
    const message = Message.createMessage(MessageType.textMessage, 'node-1', 'Hello World');
    await node1.p2pService.sendBroadcastMessage(message);
    const nodes = [node1, node2, node3];
    for (const node of nodes) {
      const receivedMessage = (await node.p2pService.getMessageDtos()).find(m => m.id === message.id);
      expect(receivedMessage.data).toEqual('Hello World');
    }
  });
});
