import { DbService } from '../db/db.service';
import { Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { MongoService } from '../db';
import { SignatureService } from './signature.service';
import { Message, MessageType } from '@bcr/types';
import { RegistrationMessageDto } from '../types/registration.dto';

interface TestServices {
  authService: SignatureService;
  dbService: DbService;
}

describe('message-auth-service', () => {
  let services1: TestServices;
  let services2: TestServices;

  beforeAll(async () => {

    async function createTestNode(name: string): Promise<TestServices> {

      const config: ApiConfigService = {
        isTestMode: true,
        dbUrl: process.env.MONGO_URL,
        nodeAddress: `http://${name}/`,
        nodeName: name,
        publicKeyBase64: 'LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJDZ0tDQVFFQXBGcU9wcTI1R3lzY1QxeS9jQ0tEOFNCN2tQWkYyNGdKUXkxNFNlVTMyQ3ZWTUxsa3F2Y0gKQ3BYY2xmbnNETXE0THBUaHcvMWZtNllDeW96a09xMWhYTHAzdmVxU3BJQW1ZeTc3OGMzSHhsSEE5V3dvRWNBaQp0Z0g4K0NLeXB1cWExWmY0YVdoZkxQQ3RsTW1MOWRHZFY4Y0pMWW0rRFBWWHlxSHJrRmhGL09aRnJBTHBCOHRoCk5wVjBMWHlqZW9EQmVzMEI4WDgwalYxVFJHN0ptZ3FVUTFJS0lBRS9zUE1iQVc4bUZWcmxjQWllQ2NZYzR6TjYKTmVrUlhDQk1WMHdXQmhRRUlESExSUXUyVXJsODRKaUlmWldSd253eU93ZHdZYzEwbG5JVWZNaGtRM3VjRkpJUQo2ejIyUFJHMTZhYkdJUllXUkxyczNEWHcydE9OM0RuRWd3SURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K',
        privateKeyBase64: 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcFFJQkFBS0NBUUVBcEZxT3BxMjVHeXNjVDF5L2NDS0Q4U0I3a1BaRjI0Z0pReTE0U2VVMzJDdlZNTGxrCnF2Y0hDcFhjbGZuc0RNcTRMcFRody8xZm02WUN5b3prT3ExaFhMcDN2ZXFTcElBbVl5Nzc4YzNIeGxIQTlXd28KRWNBaXRnSDgrQ0t5cHVxYTFaZjRhV2hmTFBDdGxNbUw5ZEdkVjhjSkxZbStEUFZYeXFIcmtGaEYvT1pGckFMcApCOHRoTnBWMExYeWplb0RCZXMwQjhYODBqVjFUUkc3Sm1ncVVRMUlLSUFFL3NQTWJBVzhtRlZybGNBaWVDY1ljCjR6TjZOZWtSWENCTVYwd1dCaFFFSURITFJRdTJVcmw4NEppSWZaV1J3bnd5T3dkd1ljMTBsbklVZk1oa1EzdWMKRkpJUTZ6MjJQUkcxNmFiR0lSWVdSTHJzM0RYdzJ0T04zRG5FZ3dJREFRQUJBb0lCQVFDRkJYSmR2MCtKaUx2eQpFOXd4OHcyZE5MQXVKTlZubUZQKzFpZDhqNVJDVnovR250YTJkUmR5M3RaWllKMUh3UytQTEJzS1dPRndCYzVPCmgvZ1U4YzFTa3UxbGZoelFIWlIwUkV2UWFzQWRhSC9uWTNHTzVGWnp2Mm95bjBxL1JEU3JXY1BKOUpyTHNjU2MKSHdBenBrTldEeGNEajIrTjUyajE3VlhPVDFQZUdtblFZS0FkcXY2dG1MU2ErbGkyNjZlUkM0cm94SEd1M05uNgpEdlRTOEUzSUhLUTJLMUFDelRBVjVYbFgwSGhFcWNyVUkwM2hvdWdyTU1yMTR6SlEyUU1nYUVTUFN5encwQlZWCi93MlM1YlM3YytKR1hHbFhtU29ldnQxdUVqVzlKSmwzWGVqZ1lTUm14WUpRUENXSGJtYmt1VjhOQmFobWQ1Wk4KOWNGR09hdkJBb0dCQU5WVCtQdDBBaXFDb0Jjb3YxaktaeFBVbnIvcWdxZVZpOHhFdHJodkhCM1RTRHVkeitMNwpVSkJIRzRoK0h2alpPL0FLaklDUHpkN0tiZ2tIc003UkhQajRrc3dEcFF3eGpPSDZWZHdaN2ZieUFtYndrSHFVCnVzS2pZV3ZDKzcvRTZGQTQ0cDVEazJnQitldHpPN0xZc0xUZjZ4S3dCcUROQUlGVDRCczh2TjZqQW9HQkFNVTYKdWdsT3dWbWFqUlRDMWo2OG03U1dBS1BrbVAzN3Y5SU5mbGN3RWlQS1lSZlVpVUhpY09zd3Jibk1odFVWbjhFZApPcllBZDlQRlhFZGZSUTFMTmRFNjMra3JtRFVwSHpENitZczJaZUgvbUhMU2JkWExZZFZtMlcrQ2x4R0djcU85CkwrMWFRanFMWFlMTkRFM0o1UWl1dCtPZnpTR054eDRvaTBDUW8wQ2hBb0dCQU5RV2ZEOWlncFRJOFdpVTlrZk0KVXRhQVdLUHMvcUNtS1NxWVZpRGZObERnc2J1emxlN1FkTFE4UGI5aHhHRWJlRitaM1Q0anVrVjVkQlErTlNZbworR2orbU5PRC9CODNWQjJHeUwzZWVaczkxKzJIMWR4STZiU0F3bVprbisxMFVwTVBPeDZsaUhPckkxRldhMC9QCjV6NnNNQVdRUThheWlZSUtaWkF1dm9lSkFvR0JBSldCZWVwNlQ2anJ0Z3hKMFh4SEhzVGFmR3ZBYXBVRkZCaFgKY0RFSldJYlc3NWpQM0tnYnpic0s4SFlLYXg3MXdGNzBHRUJFeEpDOFo4SVdudEovODdEQ0wxK2lVMFBoQXlydQo1T0U1Z0N1N3c4VXViR0lIUlFjdWFwN1Q0RTVCbTM4eGR6WTJHRVFteHVEVExJTi9DdVgxQTZKQnpZNmsyWTZyCjd6c25LUWxoQW9HQUIxdjltTDdRVWRpMC9NY0Rvd0hnRGRiMzI4a3ROR0lPYUZiVllXeWJBVG5xTmJER003T1kKU3JraGNraGZxcWhqclJJZTkwSHlEMFFlUFRleEY0Q1BNTGFFMk9reTVTeWFaSDh1eVZmbUZyTy96UEFhcE11OQpMVCt1UUxnbkpqdlhrRlBoZ0VVNTFOWmlSMzhxR1QrV2czR1htZWgzcnFIUEhuY3gwcXE4R2hjPQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo'
      } as ApiConfigService;
      const mongoService = new MongoService(config);

      const logger = new Logger();
      await mongoService.connect();
      const dbService = new DbService(mongoService, config);
      await dbService.reset();

      return {
        authService: new SignatureService(dbService, config, logger),
        dbService: dbService
      };
    }

    services1 = await createTestNode('node-1');
    services2 = await createTestNode('node-2');

    await services1.dbService.nodes.insert({
      nodeName: 'node-2',
      address: 'http://node-2/',
      publicKey: services2.authService.publicKey,
      unresponsive: false,
      blackBalled: false,
      ownerEmail: 'node-2@mail.com',
      lastSeen: new Date(),
      latestVerificationIndex: 0,
      latestVerificationHash: '',
      latestSubmissionIndex: 0,
      latestSubmissionHash: '',
      testnetRegistryWalletAddressCount: 0,
      mainnetRegistryWalletAddressCount: 0,
      isLeader: false,
      leaderVote: '',
      isStarting: false
    });

    await services2.dbService.nodes.insert({
      nodeName: 'node-1',
      address: 'http://node-1/',
      publicKey: services1.authService.publicKey,
      unresponsive: false,
      blackBalled: false,
      ownerEmail: 'node-2@mail.com',
      lastSeen: new Date(),
      latestVerificationIndex: 0,
      latestVerificationHash: '',
      latestSubmissionIndex: 0,
      latestSubmissionHash: '',
      testnetRegistryWalletAddressCount: 0,
      mainnetRegistryWalletAddressCount: 0,
      isLeader: false,
      leaderVote: '',
      isStarting: false
    });
  });

  test('public keys are setup correctly on node-1', async () => {
    const node = await services2.dbService.nodes.findOne({nodeName: 'node-1'});
    expect(node.publicKey).toBe(services1.authService.publicKey);
  });

  test('public keys are setup correctly on node-2', async () => {
    const node = await services1.dbService.nodes.findOne({nodeName: 'node-2'});
    expect(node.publicKey).toBe(services2.authService.publicKey);
  });

  test('known sender', async () => {
    const testMessage = Message.createMessage(MessageType.ping, 'node-1', 'http://node-1/', 'Hello World');
    const signedMessage = services1.authService.sign(testMessage);
    expect(signedMessage.signature).not.toBe('');
    await services2.authService.verifySignature(signedMessage);
  });

  test('unknown sender', async () => {
    const testMessage = Message.createMessage(MessageType.ping, 'node-3', 'http://node-3/', 'Hello World');
    testMessage.signature = 'sjvndkfvnjknjvdknjdkvnjd';
    await expect(services2.authService.verifySignature(testMessage)).rejects.toThrow('Unknown sender');
  });

  test('invalid signature', async () => {
    const testMessage = Message.createMessage(MessageType.ping, 'node-1', 'http://node-1/', 'Hello World');
    testMessage.signature = 'sjvndkfvnjknjvdknjdkvnjd';
    await expect(services2.authService.verifySignature(testMessage)).rejects.toThrow('Invalid signature');
  });

  test('registration message', async () => {
    const registration: RegistrationMessageDto = {
      email: 'any',
      fromPublicKey: services1.authService.publicKey,
      institutionName: 'exchange',
      fromNodeAddress: 'http://node-1/',
      fromNodeName: 'node-1'
    };

    const msg = Message.createMessage(MessageType.registration, 'node-1', 'http://node-1/', JSON.stringify(registration));
    const signedMsg = services1.authService.sign(msg);
    await services2.authService.verifyRegistration(signedMsg);
  });

});
