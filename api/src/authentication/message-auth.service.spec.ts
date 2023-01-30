import { DbService } from '../db/db.service';
import { Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { MongoService } from '../db';
import { MessageAuthService } from './message-auth.service';
import { MessageType, Message } from '@bcr/types';

interface TestServices {
  authService: MessageAuthService;
  dbService: DbService;
}

describe('message-auth-service', () => {
  let services1: TestServices;
  let services2: TestServices;

  beforeAll(async () => {

    const logger = new Logger();

    async function createTestNode(name: string): Promise<TestServices> {
      const config: ApiConfigService = {
        dbUrl: process.env.MONGO_URL + name,
        nodeAddress: `http://${name}/`,
        nodeName: name
      } as ApiConfigService;

      const mongoService = new MongoService(config);
      await mongoService.connect();
      const dbService = new DbService(mongoService);
      await dbService.reset();

      return {
        authService: new MessageAuthService(dbService, config, logger),
        dbService: dbService
      };
    }

    services1 = await createTestNode('node-1');
    services2 = await createTestNode('node-2');

    await services1.dbService.nodes.insert({
      name: 'node-2',
      address: 'http://node-2/',
      publicKey: services2.authService.publicKey,
      unresponsive: false
    });

    await services2.dbService.nodes.insert({
      name: 'node-1',
      address: 'http://node-1/',
      publicKey: services1.authService.publicKey,
      unresponsive: false
    });
  });

  test('public keys are setup correctly on node-1', async () => {
    const node = await services2.dbService.nodes.findOne({ name: 'node-1' });
    expect(node.publicKey).toBe(services1.authService.publicKey);
  });

  test('public keys are setup correctly on node-2', async () => {
    const node = await services1.dbService.nodes.findOne({ name: 'node-2' });
    expect(node.publicKey).toBe(services2.authService.publicKey);
  });

  test('known sender', async () => {
    const testMessage = Message.createMessage(MessageType.textMessage, 'node-1', 'http://node-1/', 'Hello World');
    const signedMessage = services1.authService.sign(testMessage);
    expect(signedMessage.signature).not.toBe('');
    await services2.authService.verify(signedMessage);
  });

  test('unknown sender', async () => {
    const testMessage = Message.createMessage(MessageType.textMessage, 'node-3', 'http://node-3/', 'Hello World');
    testMessage.signature = 'sjvndkfvnjknjvdknjdkvnjd';
    await expect(services2.authService.verify(testMessage)).rejects.toThrow('Unknown sender');
  });

  test('invalid signature', async () => {
    const testMessage = Message.createMessage(MessageType.textMessage, 'node-1', 'http://node-1/', 'Hello World');
    testMessage.signature = 'sjvndkfvnjknjvdknjdkvnjd';
    await expect(services2.authService.verify(testMessage)).rejects.toThrow('Invalid signature');
  });

});
