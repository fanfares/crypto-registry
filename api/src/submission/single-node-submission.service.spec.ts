import { Network, SubmissionStatus, SubmissionWalletStatus } from '@bcr/types';
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
      wallets: [{ exchangeZpub, status: SubmissionWalletStatus.WAITING_FOR_PAYMENT }],
      network: Network.testnet,
      status: SubmissionStatus.NEW,
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
    expect(submission.wallets[0].paymentAddress).toBeUndefined();
    expect(submission.receiverAddress).toBe(node1.address);
    expect(submission.leaderAddress).toBe(node1.address);
    expect(submission.status).toBe(SubmissionStatus.RETRIEVING_WALLET_BALANCE);

    await node1.submissionService.executionCycle();
    submission = await node1.db.submissions.get(submissionId);
    expect(submission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submission.confirmationsRequired).toBe(1);
    expect(submission.confirmationDate).toBe(null);

    await node1.walletService.sendFunds(exchangeZpub, submission.wallets[0].paymentAddress, submission.wallets[0].paymentAmount)
    await node1.submissionService.executionCycle();
    submission = await node1.db.submissions.get(submissionId);
    expect(submission.status).toBe(SubmissionStatus.CONFIRMED);
  });
});
