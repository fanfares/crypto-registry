import { testCustomerEmail } from '../testing';
import { TestNode } from '../network/test-node';
import { TestNetwork } from '../network/test-network';
import { getHash } from '../utils';

describe('verification-controller', () => {
  let node1: TestNode;
  let node2: TestNode;

  beforeEach(async () => {
    const network = await TestNetwork.create(2, {
      createSubmission: true,
      completeSubmission: true
    });
    node1 = network.getNode(1);
    node2 = network.getNode(2);
  });

  afterEach(async () => {
    await node1.module.close();
    await node2.module.close();
  });

  test('never send to local address when connected to network', async () => {
    const { leaderAddress } = await node1.verificationController.verify({
      email: testCustomerEmail
    });
    expect(leaderAddress).toBe('http://node-2/');
    expect(node1.sendMailService.lastSentMail).toBeUndefined();
    const node2Verification = await node2.db.verifications.findOne({
      hashedEmail: getHash(testCustomerEmail, 'simple')
    });
    expect(node2Verification.sentEmail).toBe(true);
    expect(node2Verification.confirmedBySender).toBe(false);

    const node1Verification = await node1.db.verifications.findOne({
      hash: node2Verification.hash
    });
    expect(node1Verification.sentEmail).toBe(false);
    expect(node1Verification.confirmedBySender).toBe(true);
  });

  test('send to local address when disconnected from network', async () => {
    await node1.networkController.removeNode({ nodeAddress: node2.address })
    const { leaderAddress } = await node1.verificationController.verify({
      email: testCustomerEmail
    });
    expect(leaderAddress).toBe(node1.apiConfigService.nodeAddress);
    expect(node1.sendMailService.lastSentMail).toBeDefined();
  });
});
