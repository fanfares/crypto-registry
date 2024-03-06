import { ExchangeStatus, FundingSubmissionStatus } from '@bcr/types';
import { TestNetwork, TestNode } from '../testing';

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
    const {
      fundingSubmissionId,
      signedAddress,
      message,
      address
    } = await node1.createTestFundingSubmission();

    let fundingSubmission = await node1.db.fundingSubmissions.get(fundingSubmissionId);
    let fundingAddresses = await node1.db.fundingAddresses.find({fundingSubmissionId});
    expect(fundingAddresses[0].address).toBe(address);
    expect(fundingAddresses[0].signature).toBe(signedAddress.signature);
    expect(fundingAddresses[0].balance).toBe(null);
    expect(fundingSubmission.totalFunds).toBe(null);
    expect(fundingSubmission.signingMessage).toBe(message);
    expect(fundingSubmission.status).toBe(FundingSubmissionStatus.WAITING_FOR_PROCESSING);

    await node1.fundingSubmissionService.executionCycle();
    fundingSubmission = await node1.db.fundingSubmissions.get(fundingSubmissionId);
    fundingAddresses = await node1.db.fundingAddresses.find({fundingSubmissionId});
    expect(fundingSubmission.totalFunds).toBe(30000000);
    expect(fundingAddresses[0].balance).toBe(30000000);
    expect(fundingSubmission.status).toBe(FundingSubmissionStatus.ACCEPTED);

    const exchange = await node1.db.exchanges.get(fundingSubmission.exchangeId);
    expect(exchange.currentFunds).toBe(30000000);
    expect(exchange.status).toBe(ExchangeStatus.AWAITING_DATA);
  });

  it('should manage isCurrent flag', async () => {
    const { fundingSubmissionId: previousId} = await node1.createTestFundingSubmission();
    let previous = await node1.db.fundingSubmissions.get(previousId);
    expect(previous.isCurrent).toBe(false);

    await node1.fundingSubmissionService.executionCycle();
    previous = await node1.db.fundingSubmissions.get(previousId);
    expect(previous.isCurrent).toBe(true);

    const { fundingSubmissionId: currentId } = await node1.createTestFundingSubmission();
    await node1.fundingSubmissionService.executionCycle();

    previous = await node1.db.fundingSubmissions.get(previousId);
    expect(previous.isCurrent).toBe(false);

    const current = await node1.db.fundingSubmissions.get(currentId);
    expect(current.isCurrent).toBe(true);
  });
});
