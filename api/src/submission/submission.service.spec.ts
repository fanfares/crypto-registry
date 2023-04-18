import { SubmissionStatus } from '@bcr/types';
import { exchangeMnemonic } from '../crypto/exchange-mnemonic';
import { Bip84Account } from '../crypto/bip84-account';
import { TestNode } from '../network/test-node';
import { TestNetwork } from '../network/test-network';

describe('submission-service', () => {
  const exchangeName = 'Exchange 1';
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  let node1: TestNode;
  let node2: TestNode;
  let node3: TestNode;
  let network: TestNetwork;

  beforeAll(async () => {
    network = await TestNetwork.create(3);
    node1 = network.getNode(1);
    node2 = network.getNode(2);
    node3 = network.getNode(3);
  });

  afterEach(async () => {
    await network.reset();
  });

  afterAll(async () => {
    await network.destroy();
  });

  async function runCreateSubmissionTest(receivingNode: TestNode, otherNodes: TestNode[]) {
    const submissionId = await receivingNode.submissionService.createSubmission({
      initialNodeAddress: receivingNode.address,
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

    let submissionRecordTestNode1 = await receivingNode.db.submissions.get(submissionId);
    expect(submissionRecordTestNode1.index).toBe(1);
    expect(submissionRecordTestNode1.paymentAddress).toBeDefined();
    expect(submissionRecordTestNode1.precedingHash).toBe('genesis');
    expect(submissionRecordTestNode1.hash).toBeDefined();
    expect(submissionRecordTestNode1.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(await receivingNode.db.submissions.count({})).toBe(1);

    for (const otherNode of otherNodes) {
      const submissionRecord = await otherNode.db.submissions.get(submissionId);
      expect(submissionRecord.index).toBe(1);
      expect(submissionRecord.paymentAddress).toBe(submissionRecordTestNode1.paymentAddress);
      expect(submissionRecord.hash).toBe(submissionRecordTestNode1.hash);
      expect(submissionRecord.precedingHash).toBe('genesis');
      expect(submissionRecord.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
      expect(await otherNode.db.submissions.count({})).toBe(1);
    }

    expect(await node1.walletService.isUsedAddress(submissionRecordTestNode1.paymentAddress)).toBe(true);
    expect(await node2.walletService.isUsedAddress(submissionRecordTestNode1.paymentAddress)).toBe(true);
    expect(await node3.walletService.isUsedAddress(submissionRecordTestNode1.paymentAddress)).toBe(true);

    await receivingNode.walletService.sendFunds(exchangeZpub, submissionRecordTestNode1.paymentAddress, submissionRecordTestNode1.paymentAmount);
    await receivingNode.submissionService.waitForSubmissionsForPayment();
    submissionRecordTestNode1 = await receivingNode.db.submissions.get(submissionId);
    expect(submissionRecordTestNode1.status).toBe(SubmissionStatus.WAITING_FOR_CONFIRMATION);

    let node1Confirmations = await receivingNode.db.submissionConfirmations.count({
      submissionId: submissionRecordTestNode1._id
    });
    expect(node1Confirmations).toBe(1);

    for (const otherNode of otherNodes) {
      await otherNode.submissionService.waitForSubmissionsForPayment();
    }

    node1Confirmations = await receivingNode.db.submissionConfirmations.count({
      submissionId: submissionRecordTestNode1._id
    });
    expect(node1Confirmations).toBe(3);

    for (const followerNode of otherNodes) {
      const node2Confirmations = await followerNode.db.submissionConfirmations.count({
        submissionId: submissionRecordTestNode1._id
      });
      expect(node2Confirmations).toBe(3);
    }

    submissionRecordTestNode1 = await receivingNode.db.submissions.get(submissionId);
    expect(submissionRecordTestNode1.status).toBe(SubmissionStatus.CONFIRMED);

    for (const otherNode of otherNodes) {
      const submissionRecordTestNode2 = await otherNode.db.submissions.get(submissionId);
      expect(submissionRecordTestNode2.status).toBe(SubmissionStatus.CONFIRMED);
      expect(await otherNode.db.submissions.count({})).toBe(1);
    }
  }

  it('leader receives submission', async () => {
    await network.setLeader(node1.address);
    expect((await node1.nodeService.getThisNode()).isLeader).toBe(true);
    await runCreateSubmissionTest(node1, [node2, node3]);
  });

  it('follower receives submission', async () => {
    await network.setLeader(node1.address);
    expect((await node1.nodeService.getThisNode()).isLeader).toBe(true);
    expect((await node2.nodeService.getThisNode()).isLeader).toBe(false);
    expect((await node1.nodeService.getLeader()).address).toBe('http://node-1/');
    expect((await node2.nodeService.getLeader()).address).toBe('http://node-1/');
    await runCreateSubmissionTest(node2, [node1, node3]);
  });
});
