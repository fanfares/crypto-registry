import { SubmissionStatus } from '@bcr/types';
import { exchangeMnemonic } from '../crypto/exchange-mnemonic';
import { Bip84Utils } from '../crypto/bip84-utils';
import { TestNetwork, TestNode } from '../testing';

describe('submission-service', () => {
  const exchangeName = 'Exchange 1';
  const exchangeZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic);
  let node1: TestNode;
  let network: TestNetwork;

  beforeAll(async () => {
    network = await TestNetwork.create(1, {
      useStartMode: false,
      singleNode: true
    });
    node1 = network.getNode(1);
  });

  afterEach(async () => {
    await network.reset();
  });

  afterAll(async () => {
    await network.destroy();
  });

  it('create submission', async () => {

    const submissionId = await node1.submissionService.createSubmission({
      receiverAddress: node1.address,
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'Hash-Customer-1@mail.com',
        amount: 10000000
      }, {
        hashedEmail: 'hash-customer-2@mail.com',
        amount: 20000000
      }]
    });

    let submission = await node1.db.submissions.get(submissionId);
    expect(submission.balanceRetrievalAttempts).toBe(0);
    expect(submission.paymentAddress).toBeDefined();
    expect(submission.receiverAddress).toBe(node1.address);
    expect(submission.leaderAddress).toBe(null);
    expect(submission.status).toBe(SubmissionStatus.RETRIEVING_WALLET_BALANCE);

    await node1.submissionService.executionCycle();
    submission = await node1.db.submissions.get(submissionId);
    expect(submission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submission.confirmationsRequired).toBe(1);
    expect(submission.confirmationDate).toBe(null);

    await node1.walletService.sendFunds(exchangeZpub, submission.paymentAddress, submission.paymentAmount)
    await node1.submissionService.executionCycle();
    submission = await node1.db.submissions.get(submissionId);
    expect(submission.status).toBe(SubmissionStatus.CONFIRMED);



  });
});
