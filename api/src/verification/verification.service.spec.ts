import subDays from 'date-fns/subDays';
import { TestNode } from '../network/test-node';
import { getHash } from '../utils';
import { TestNetwork } from '../network/test-network';
import { testCustomerEmail } from '../testing';
import { testExchangeName } from '../testing/test-exchange-name';

describe('verification-service', () => {
  let testNode: TestNode;
  let network: TestNetwork;
  let submissionId: string;

  beforeAll(async () => {
    network = await TestNetwork.create(1);
    testNode = network.getNode(1);
  });

  beforeEach(async () => {
    await testNode.reset();
    await network.setLeader(testNode.address);
    submissionId = await testNode.createTestSubmission({
      completeSubmission: true
    });
  });

  afterAll(async () => {
    await testNode.destroy();
  });

  it('verify valid holdings', async () => {
    await testNode.verificationService.verify({
      email: testCustomerEmail,
      initialNodeAddress: testNode.address,
      selectedNodeAddress: testNode.address,
      requestDate: new Date()
    });
    expect(testNode.sendMailService.getVal('verifiedHoldings')[0].exchangeName).toBe(testExchangeName);
    expect(testNode.sendMailService.getVal('verifiedHoldings')[0].customerHoldingAmount).toBe(0.1);
    expect(testNode.sendMailService.getVal('toEmail')).toBe(testNode.sendMailService.getLastToEmail());

    const verificationRecord = await testNode.db.verifications.findOne({
      hashedEmail: getHash(testCustomerEmail, 'simple')
    });
    expect(verificationRecord.leaderAddress).toBe(testNode.address);
  });

  it('should throw exception if email is not submitted', async () => {
    await expect(testNode.verificationService.verify({
      email: 'not-submitted@mail.com',
      initialNodeAddress: testNode.address,
      selectedNodeAddress: testNode.address,
      requestDate: new Date()
    })).rejects.toThrow();
    expect(testNode.sendMailService.noEmailSent).toBe(true);
  });

  it('should not verify if submission is too old', async () => {
    const oldDate = subDays(Date.now(), 8);
    await testNode.db.submissions.update(submissionId, {
      createdDate: oldDate
    });

    await expect(testNode.verificationService.verify({
      email: 'not-submitted@mail.com',
      initialNodeAddress: testNode.address,
      selectedNodeAddress: testNode.address,
      requestDate: new Date()
    })).rejects.toThrow();
    expect(testNode.sendMailService.noEmailSent).toBe(true);
  });
});
