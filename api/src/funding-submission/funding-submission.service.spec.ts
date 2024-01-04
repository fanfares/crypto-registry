import { ExchangeStatus, FundingSubmissionStatus, Network } from '@bcr/types';
import { TestNetwork, TestNode } from '../testing';
import { Bip84Utils } from '../crypto/bip84-utils';
import { exchangeMnemonic } from '../crypto/exchange-mnemonic';
import { getSigningMessage } from '../crypto/get-signing-message';

describe('funding-submission-service', () => {
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
    const submissionId = await node1.createTestFundingSubmission();
    const bip42Utils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet);
    const address = bip42Utils.getAddress(0, false);
    const message = getSigningMessage();
    const signedAddress = bip42Utils.sign(0, false, message);

    let fundingSubmission = await node1.db.fundingSubmissions.get(submissionId);
    expect(fundingSubmission.addresses[0].address).toBe(address);
    expect(fundingSubmission.addresses[0].signature).toBe(signedAddress.signature);
    expect(fundingSubmission.addresses[0].balance).toBe(null);
    expect(fundingSubmission.totalFunds).toBe(null);
    expect(fundingSubmission.signingMessage).toBe(message);
    expect(fundingSubmission.status).toBe(FundingSubmissionStatus.RETRIEVING_BALANCES);

    await node1.fundingSubmissionService.executionCycle();
    fundingSubmission = await node1.db.fundingSubmissions.get(submissionId);
    expect(fundingSubmission.totalFunds).toBe(30000000);
    expect(fundingSubmission.addresses[0].balance).toBe(30000000);
    expect(fundingSubmission.status).toBe(FundingSubmissionStatus.ACCEPTED);

    const exchange = await node1.db.exchanges.get(fundingSubmission.exchangeId)
    expect(exchange.currentFunds).toBe(30000000)
    expect(exchange.status).toBe(ExchangeStatus.AWAITING_DATA)
  });

  it('should manage isCurrent flag', async () => {
    const previousId = await node1.createTestFundingSubmission();
    let previous = await node1.db.fundingSubmissions.get(previousId);
    expect(previous.isCurrent).toBe(false);

    await node1.fundingSubmissionService.executionCycle();
    previous = await node1.db.fundingSubmissions.get(previousId);
    expect(previous.isCurrent).toBe(true);

    const currentId = await node1.createTestFundingSubmission();
    await node1.fundingSubmissionService.executionCycle();

    previous = await node1.db.fundingSubmissions.get(previousId);
    expect(previous.isCurrent).toBe(false);

    const current = await node1.db.fundingSubmissions.get(currentId);
    expect(current.isCurrent).toBe(true);
  })
});
