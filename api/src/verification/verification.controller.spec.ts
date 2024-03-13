import { TEST_CUSTOMER_EMAIL, TestNode } from '../testing';
import { getHash } from '../utils';
import { VerificationStatus } from '@bcr/types';

describe('verification-controller', () => {
  let node1: TestNode;

  beforeAll(async () => {
    node1 = await TestNode.createTestNode(1);
  });

  beforeEach(async () => {
    await node1.reset();
    await node1.createTestFundingSubmission(true, 0);
    await node1.fundingSubmissionService.executionCycle();
    await node1.createTestHoldingsSubmission()
  });

  afterAll(async () => {
    await node1.destroy();
  });

  test('simple verification', async () => {
    const verification = await node1.verificationController.createVerification({
      email: TEST_CUSTOMER_EMAIL
    });
    expect(verification.status).toBe(VerificationStatus.SENT)
    expect(verification.hashedEmail).toBe(getHash(TEST_CUSTOMER_EMAIL, 'simple'));
    expect(node1.mockMailService.lastMailTo).toBe(TEST_CUSTOMER_EMAIL);
  });
});
