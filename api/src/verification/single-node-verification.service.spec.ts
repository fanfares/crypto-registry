import { testCustomerEmail, TestNetwork, TestNode } from '../testing';
import { getHash } from '../utils';
import { VerificationStatus } from "@bcr/types";

describe('single-node-verification-service', () => {
  let node1: TestNode;
  let network: TestNetwork;

  afterAll(async () => {
    await network.destroy();
  });

  beforeAll(async () => {
    network = await TestNetwork.create(1, {
      singleNode: true
    });
    node1 = network.getNode(1);
  });

  beforeEach(async () => {
    await network.reset();
    await network.createTestSubmission(node1, {
      sendPayment: true,
      additionalSubmissionCycles: 3
    });
  });

  it('single node verification', async () => {
    const {verificationId} = await node1.verificationService.createVerification({
      email: testCustomerEmail,
      receivingAddress: node1.address,
      leaderAddress: node1.address,
      requestDate: new Date(),
      status: VerificationStatus.RECEIVED
    });

    // leader should send the email
    expect(node1.sendMailService.noEmailSent).toBe(false);

    const leaderVerificationRecord = await node1.db.verifications.get(verificationId);
    expect(leaderVerificationRecord.hashedEmail).toBe(getHash(testCustomerEmail, 'simple'))
    expect(leaderVerificationRecord.leaderAddress).toBe(node1.address);
    expect(leaderVerificationRecord.receivingAddress).toBe(node1.address);
    expect(leaderVerificationRecord.status).toBe(VerificationStatus.SENT);
  });
});
