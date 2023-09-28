import { Network, SubmissionStatus, SubmissionWalletStatus } from '@bcr/types';
import { exchangeMnemonic } from '../crypto/exchange-mnemonic';
import { Bip84Utils } from '../crypto/bip84-utils';
import { TestNetwork, TestNode } from '../testing';
import { getNow } from '../utils';

jest.setTimeout(1000000)

describe('networked-submission-service', () => {
  const exchangeName = 'Exchange 1';
  const exchangeZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic);
  let node1: TestNode;
  let node2: TestNode;
  let node3: TestNode;
  let network: TestNetwork;

  beforeAll(async () => {
    network = await TestNetwork.create(3, {
      useStartMode: false
    });
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

  async function runCreateSubmissionTest(
    receivingNode: TestNode,
    otherNodes: TestNode[],
    bitcoinError: boolean
  ) {
    if (bitcoinError) {
      receivingNode.setBitcoinNextRequestStatusCode(429);
      otherNodes.forEach(node => node.setBitcoinNextRequestStatusCode(429))
    }

    const submissionId = await receivingNode.submissionService.createSubmission({
      receiverAddress: receivingNode.address,
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

    // Extra cycles required to pick up the failures.
    await receivingNode.submissionService.executionCycle();
    await Promise.all(otherNodes.map(node => node.submissionService.executionCycle()));
    await receivingNode.submissionService.executionCycle();
    await Promise.all(otherNodes.map(node => node.submissionService.executionCycle()));
    await receivingNode.submissionService.executionCycle();
    await Promise.all(otherNodes.map(node => node.submissionService.executionCycle()));

    let submissionFromReceiver = await receivingNode.db.submissions.get(submissionId);
    const walletFromReceiver = submissionFromReceiver.wallets[0]
    expect(walletFromReceiver.paymentAddress).toBeDefined();
    expect(walletFromReceiver.status).toBe(SubmissionWalletStatus.WAITING_FOR_PAYMENT);
    expect(walletFromReceiver.paymentAddressIndex).toBe(0);
    expect(submissionFromReceiver.receiverAddress).toBe(receivingNode.address);
    expect(submissionFromReceiver.leaderAddress).toBe(node1.address);
    expect(submissionFromReceiver.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submissionFromReceiver.confirmationsRequired).toBe(2);
    expect(submissionFromReceiver.confirmationDate).toBe(null);
    expect(await receivingNode.db.submissions.count({})).toBe(1);
    expect(await receivingNode.db.submissionConfirmations.count({submissionId: submissionFromReceiver._id})).toBe(0);

    for (const otherNode of otherNodes) {
      const otherSubmission = await otherNode.db.submissions.get(submissionId);
      expect(otherSubmission.wallets[0].paymentAddress).toBe(walletFromReceiver.paymentAddress);
      expect(otherSubmission.receiverAddress).toBe(receivingNode.address);
      expect(otherSubmission.leaderAddress).toBe(node1.address);
      expect(otherSubmission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
      expect(otherSubmission.confirmationsRequired).toBe(2);
      expect(otherSubmission.confirmationDate).toBe(null);
      expect(await otherNode.db.submissions.count({})).toBe(1);
      expect(await otherNode.db.submissionConfirmations.count({submissionId: submissionFromReceiver._id})).toBe(0);
    }

    await receivingNode.walletService.sendFunds(exchangeZpub, walletFromReceiver.paymentAddress, walletFromReceiver.paymentAmount);
    await network.execSubmissionCycle();
    submissionFromReceiver = await receivingNode.db.submissions.get(submissionId);
    expect(submissionFromReceiver.status).toBe(SubmissionStatus.CONFIRMED);

    let node1Confirmations = await receivingNode.db.submissionConfirmations.count({
      submissionId: submissionFromReceiver._id
    });
    expect(node1Confirmations).toBe(3);

    for (const otherNode of otherNodes) {
      await otherNode.submissionService.executionCycle();
    }

    node1Confirmations = await receivingNode.db.submissionConfirmations.count({
      submissionId: submissionFromReceiver._id
    });
    expect(node1Confirmations).toBe(3);

    for (const followerNode of otherNodes) {
      const node2Confirmations = await followerNode.db.submissionConfirmations.count({
        submissionId: submissionFromReceiver._id
      });
      expect(node2Confirmations).toBe(3);
    }

    submissionFromReceiver = await receivingNode.db.submissions.get(submissionId);
    expect(submissionFromReceiver.status).toBe(SubmissionStatus.CONFIRMED);
    const timeDiff = getNow().getTime() - submissionFromReceiver.confirmationDate.getTime()
    expect(timeDiff).toBeLessThan(5000);

    for (const otherNode of otherNodes) {
      const submissionRecordTestNode2 = await otherNode.db.submissions.get(submissionId);
      expect(submissionRecordTestNode2.status).toBe(SubmissionStatus.CONFIRMED);
      expect(await otherNode.db.submissions.count({})).toBe(1);
      const timeDiff = getNow().getTime() - submissionRecordTestNode2.confirmationDate.getTime()
      expect(timeDiff).toBeLessThan(5000);
    }
  }

  it('leader receives submission', async () => {
    await network.setLeader(node1.address);
    expect((await node1.nodeService.getThisNode()).isLeader).toBe(true);
    await runCreateSubmissionTest(node1, [node2, node3], false);
  });

  it('leader receives submission (with bitcoin 429)', async () => {
    await network.setLeader(node1.address);
    await runCreateSubmissionTest(node1, [node2, node3], true);
  });

  it('follower receives submission', async () => {
    await network.setLeader(node1.address);
    expect(await node1.nodeService.getThisNodeIsLeader()).toBe(true);
    expect(await node2.nodeService.getThisNodeIsLeader()).toBe(false);
    expect(await node1.nodeService.getLeaderAddress()).toBe('http://node-1/');
    expect(await node2.nodeService.getLeaderAddress()).toBe('http://node-1/');
    await runCreateSubmissionTest(node2, [node1, node3], false);
  });

  it('follower receives submission (with 429)', async () => {
    await network.setLeader(node1.address);
    await runCreateSubmissionTest(node2, [node1, node3], true);
  });
});
