import { Network, SubmissionStatus } from '@bcr/types';
import { TestNetwork, TestNode } from '../testing';
import { Bip84Utils } from '../crypto/bip84-utils';
import { exchangeMnemonic } from '../crypto/exchange-mnemonic';
import { getSigningMessage } from '../crypto/get-signing-message';

describe('submission-service', () => {
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
    const submissionId = await node1.createTestSubmission();
    const bip42Utils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet);
    const address = bip42Utils.getAddress(0, false);
    const message = getSigningMessage();
    const signedAddress = bip42Utils.sign(0, false, message);

    let submission = await node1.db.submissions.get(submissionId);
    expect(submission.wallets[0].address).toBe(address);
    expect(submission.wallets[0].signature).toBe(signedAddress.signature);
    expect(submission.wallets[0].balance).toBeUndefined();
    expect(submission.totalCustomerFunds).toBe(10000000 + 20000000);
    expect(submission.signingMessage).toBe(message);
    expect(submission.receiverAddress).toBe(node1.address);
    expect(submission.status).toBe(SubmissionStatus.RETRIEVING_WALLET_BALANCE);

    await node1.submissionService.executionCycle();
    submission = await node1.db.submissions.get(submissionId);
    expect(submission.wallets[0].balance).toBe(30000000);
    expect(submission.status).toBe(SubmissionStatus.CONFIRMED);
    expect(submission.confirmationsRequired).toBe(1);
    expect(submission.confirmationDate).toBeDefined();
  });
});
