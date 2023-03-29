import subDays from 'date-fns/subDays';
import { TestNode } from '../network/test-node';
import { getHash } from '../utils';

describe('verification-service', () => {
  let testNode: TestNode;

  beforeEach(async () => {
    testNode = await TestNode.createTestNode(1, {
      createSubmission: true,
      completeSubmission: true
    });
  });

  afterEach(async () => {
    await testNode.module.close();
  });

  it('verify valid holdings', async () => {
    await testNode.verificationService.verify({
      email: testNode.ids.customerEmail,
      initialNodeAddress: testNode.address,
      selectedNodeAddress: testNode.address,
      requestDate: new Date()
    });
    expect(testNode.sendMailService.getVal('verifiedHoldings')[0].exchangeName).toBe(testNode.ids.exchangeName);
    expect(testNode.sendMailService.getVal('verifiedHoldings')[0].customerHoldingAmount).toBe(0.1);
    expect(testNode.sendMailService.getVal('toEmail')).toBe(testNode.sendMailService.getLastToEmail());

    const verificationRecord = await testNode.db.verifications.findOne({
      hashedEmail: getHash(testNode.ids.customerEmail, 'simple')
    });
    expect(verificationRecord.leaderAddress).toBe(testNode.address)
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
    await testNode.db.submissions.updateMany({
      paymentAddress: testNode.ids.submissionAddress
    }, {
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
