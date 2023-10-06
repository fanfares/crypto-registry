import { SubmissionStatus } from '@bcr/types';
import { TestNetwork, TestNode } from '../testing';
import { getNow } from '../utils';

jest.setTimeout(1000000);

describe('networked-submission-service', () => {
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
      otherNodes.forEach(node => node.setBitcoinNextRequestStatusCode(429));
    }

    const submissionId = await receivingNode.createTestSubmission();

    let submissionFromReceiver = await receivingNode.db.submissions.get(submissionId);
    const walletFromReceiver = submissionFromReceiver.wallets[0];
    expect(walletFromReceiver.address).toBeDefined();
    expect(submissionFromReceiver.receiverAddress).toBe(receivingNode.address);
    expect(submissionFromReceiver.status).toBe(SubmissionStatus.RETRIEVING_WALLET_BALANCE);
    expect(submissionFromReceiver.confirmationsRequired).toBe(2);
    expect(submissionFromReceiver.confirmationDate).toBe(null);
    expect(await receivingNode.db.submissions.count({})).toBe(1);
    expect(await receivingNode.db.submissionConfirmations.count({submissionId: submissionFromReceiver._id})).toBe(0);

    for (const otherNode of otherNodes) {
      const otherSubmission = await otherNode.db.submissions.get(submissionId);
      expect(otherSubmission.wallets[0].address).toBe(walletFromReceiver.address);
      expect(otherSubmission.receiverAddress).toBe(receivingNode.address);
      expect(otherSubmission.status).toBe(SubmissionStatus.RETRIEVING_WALLET_BALANCE);
      expect(otherSubmission.confirmationsRequired).toBe(2);
      expect(otherSubmission.confirmationDate).toBe(null);
      expect(await otherNode.db.submissions.count({})).toBe(1);
      expect(await otherNode.db.submissionConfirmations.count({submissionId: submissionFromReceiver._id})).toBe(0);
    }

    await network.execSubmissionCycle();

    submissionFromReceiver = await receivingNode.db.submissions.get(submissionId);
    expect(submissionFromReceiver.status).toBe(SubmissionStatus.WAITING_FOR_CONFIRMATION);
    expect(await receivingNode.db.submissionConfirmations.count({submissionId: submissionFromReceiver._id})).toBe(3);

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
    const timeDiff = getNow().getTime() - submissionFromReceiver.confirmationDate.getTime();
    expect(timeDiff).toBeLessThan(5000);

    for (const otherNode of otherNodes) {
      const submissionRecordTestNode2 = await otherNode.db.submissions.get(submissionId);
      expect(submissionRecordTestNode2.status).toBe(SubmissionStatus.CONFIRMED);
      expect(await otherNode.db.submissions.count({})).toBe(1);
      const timeDiff = getNow().getTime() - submissionRecordTestNode2.confirmationDate.getTime();
      expect(timeDiff).toBeLessThan(5000);
    }
  }

  it('create submission', async () => {
    await runCreateSubmissionTest(node1, [node2, node3], false);
  });

  // it('leader receives submission (with bitcoin 429)', async () => {
  //   await network.setLeader(node1.address);
  //   await runCreateSubmissionTest(node1, [node2, node3], true);
  // });
});
