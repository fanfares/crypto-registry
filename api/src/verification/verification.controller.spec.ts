import { testCustomerEmail } from '../testing';
import { TestNode } from '../network/test-node';
import { TestNetwork } from '../network/test-network';
import { getHash } from '../utils';
import { VerificationStatus } from "@bcr/types";

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

  test('receiver is not leader', async () => {
    const {leaderAddress} = await node1.verificationController.createVerification({
      email: testCustomerEmail
    });
    expect(leaderAddress).toBe('http://node-2/');

    // Node1 should not send an email as it is not the leader
    expect(node1.sendMailService.lastSentMail).toBeUndefined();

    // Node2 should have sent the email and confirmed back to node1 that it was confirmed.
    const node2Verification = await node2.db.verifications.findOne({
      hashedEmail: getHash(testCustomerEmail, 'simple')
    });
    expect(node2Verification.leaderAddress).toBe('http://node-2/');
    expect(node2Verification.status).toBe(VerificationStatus.SENT);

    const node1Verification = await node1.db.verifications.findOne({
      hash: node2Verification.hash
    });
    expect(node1Verification.leaderAddress).toBe('http://node-2/');
    expect(node2Verification.status).toBe(VerificationStatus.SENT);
  });

  test('single node network', async () => {
    await node1.networkController.removeNode({nodeAddress: node2.address})
    await network.setLeader(node1.address);
    const {leaderAddress} = await node1.verificationController.createVerification({
      email: testCustomerEmail
    });
    expect(leaderAddress).toBe(node1.apiConfigService.nodeAddress);
    expect(node1.sendMailService.lastSentMail).toBeDefined();
  });
});
