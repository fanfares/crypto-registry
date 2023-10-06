import { testCustomerEmail, TestNetwork, TestNode } from '../testing';
import { getHash } from '../utils';
import { VerificationStatus } from "@bcr/types";

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
    await network.createTestSubmission(node1, {
      additionalSubmissionCycles: 4
    })
  });

  afterAll(async () => {
    await network.destroy();
  });

  test('receiver is not leader', async () => {
    const {leaderAddress} = await node1.verificationController.createVerification({
      email: testCustomerEmail
    });
    expect(leaderAddress).toBe('http://node-2/');

    // Node1 should not send an email as it is not the leader
    expect(node1.sendMailService.lastSentMail).toBe(null)

    // Node2 should have sent the email and confirmed back to node1 that it was confirmed.
    const node2Verification = await node2.db.verifications.findOne({
      hashedEmail: getHash(testCustomerEmail, 'simple')
    });
    expect(node2Verification.leaderAddress).toBe('http://node-2/');
    expect(node2Verification.status).toBe(VerificationStatus.SENT);

    const node1Verification = await node1.db.verifications.findOne({
      _id: node2Verification._id
    });
    expect(node1Verification.leaderAddress).toBe('http://node-2/');
    expect(node2Verification.status).toBe(VerificationStatus.SENT);
  });

  test('single node network', async () => {
    await node1.nodeController.removeNode({nodeAddress: node2.address})
    await network.setLeader(node1.address);
    const {leaderAddress} = await node1.verificationController.createVerification({
      email: testCustomerEmail
    });
    expect(leaderAddress).toBe(node1.apiConfigService.nodeAddress);
    expect(node1.sendMailService.lastSentMail).toBeDefined();
  });
});
