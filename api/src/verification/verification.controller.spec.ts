import { TEST_CUSTOMER_EMAIL, TestNetwork, TestNode } from '../testing';
import { getHash } from '../utils';
import { VerificationStatus } from '@bcr/types';

describe('verification-controller', () => {
  let node1: TestNode;
  let node2: TestNode;
  let network: TestNetwork;

  beforeAll(async () => {
    network = await TestNetwork.create(3);
    node1 = network.getNode(1);
    node2 = network.getNode(2);
  });

  beforeEach(async () => {
    await network.reset();
    await network.setLeader(node2.address);
    await network.createTestSubmissions(node1, {
      additionalSubmissionCycles: 1
    })
  });

  afterAll(async () => {
    await network.destroy();
  });

  test('single node network', async () => {
    await node1.nodeController.removeNode({nodeAddress: node2.address})
    await network.setLeader(node1.address);
    const verification = await node1.verificationController.createVerification({
      email: TEST_CUSTOMER_EMAIL
    });
    expect(verification.status).toBe(VerificationStatus.SENT)
    expect(verification.hashedEmail).toBe(getHash(TEST_CUSTOMER_EMAIL, 'simple'));
    expect(node1.sendMailService.lastSentMail.to).toBe(TEST_CUSTOMER_EMAIL);
  });
});
