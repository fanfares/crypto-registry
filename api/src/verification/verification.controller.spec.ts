import { testCustomerEmail } from '../testing';
import { TestNode } from '../network/test-node';
import { TestNetwork } from '../network/test-network';
import { getHash } from '../utils';

describe('verification-controller', () => {
  let node1: TestNode;
  let node2: TestNode;
  let network: TestNetwork;

  beforeEach(async () => {
    network = await TestNetwork.create(2);
    node1 = network.getNode(1);
    node2 = network.getNode(2);
    await network.setLeader(node2.address);
    await network.createTestSubmission(node1)
  });

  afterEach(async () => {
    await network.reset();
  })

  afterAll(async () => {
    await network.destroy();
  });

  test('never send to local address when connected to network', async () => {
    const {leaderAddress} = await node1.verificationController.verify({
      email: testCustomerEmail
    });
    expect(leaderAddress).toBe('http://node-2/');

    // Node1 should not send an email as it is not the leaer
    expect(node1.sendMailService.lastSentMail).toBeUndefined();

    // Node2 should have sent the email and confirmed back to node1 that it was confirmed.
    const node2Verification = await node2.db.verifications.findOne({
      hashedEmail: getHash(testCustomerEmail, 'simple')
    });
    expect(node2Verification.sentEmail).toBe(true);
    expect(node2Verification.confirmedBySender).toBe(true);

    const node1Verification = await node1.db.verifications.findOne({
      hash: node2Verification.hash
    });
    expect(node1Verification.sentEmail).toBe(false);
    expect(node1Verification.confirmedBySender).toBe(true);
  });

  test('send to local address when disconnected from network', async () => {
    await node1.networkController.removeNode({nodeAddress: node2.address})
    const {leaderAddress} = await node1.verificationController.verify({
      email: testCustomerEmail
    });
    expect(leaderAddress).toBe(node1.apiConfigService.nodeAddress);
    expect(node1.sendMailService.lastSentMail).toBeDefined();
  });
});
