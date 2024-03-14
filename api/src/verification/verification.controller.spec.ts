import { TEST_CUSTOMER_EMAIL, TestNode } from '../testing';
import { getHash } from '../utils';
import { Network, VerificationStatus } from '@bcr/types';
import { v4 as uuid } from 'uuid';
import { TEST_EXCHANGE_NAME } from '../testing/test-exchange-name';

describe('verification-controller', () => {
  let node1: TestNode;

  beforeAll(async () => {
    node1 = await TestNode.createTestNode(1);
  });

  beforeEach(async () => {
    await node1.reset();
    await node1.createTestFundingSubmission(true, 0);
    await node1.fundingSubmissionService.executionCycle();
  });

  afterAll(async () => {
    await node1.destroy();
  });

  test('verify by email', async () => {
    await node1.createTestHoldingsSubmission()
    const verification = await node1.verificationController.createVerification({
      email: TEST_CUSTOMER_EMAIL
    });
    expect(verification.status).toBe(VerificationStatus.SUCCESS)
    expect(verification.hashedEmail).toBe(getHash(TEST_CUSTOMER_EMAIL, 'simple'));
    expect(node1.mockMailService.lastMailTo).toBe(TEST_CUSTOMER_EMAIL);
  });

  test('verify by uid', async () => {
    const uid = uuid()
    await node1.createTestHoldingsSubmission({
      exchangeUid: uid,
      amount: 123000
    })
    const { verifiedHoldings , verificationId} = await node1.verificationController.verifyByUid({uid })
    expect(verifiedHoldings[0].exchangeName).toBe(TEST_EXCHANGE_NAME)
    expect(verifiedHoldings[0].customerHoldingAmount).toBe(123000)
    expect(verifiedHoldings[0].fundingSource).toBe(Network.testnet)
    expect(verifiedHoldings[0].fundingAsAt).toBeDefined();
  });
});
