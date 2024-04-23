import { ExchangeStatus, Network } from '@bcr/types';
import { TestNode } from '../testing';
import { FundingAddressStatus } from '../types/funding-address.type';


describe('funding-submission-service', () => {
  let node1: TestNode;

  beforeAll(async () => {
    node1 = await TestNode.createTestNode(1, {
      singleNode: true
    });
  });

  beforeEach(async () => {
    await node1.reset();
  });

  afterAll(async () => {
    await node1.destroy();
  });

  it('create new submission', async () => {
    const {
      fundingSubmissionId,
      signedAddress,
      message,
      address
    } = await node1.createTestFundingSubmission(true, 0);

    let fundingSubmission = await node1.db.fundingSubmissions.get(fundingSubmissionId);
    let fundingAddresses = await node1.db.fundingAddresses.find({fundingSubmissionId});
    expect(fundingAddresses[0].address).toBe(address);
    expect(fundingAddresses[0].signature).toBe(signedAddress.signature);
    expect(fundingAddresses[0].balance).toBe(null);
    expect(fundingAddresses[0].message).toBe(message);
    expect(fundingAddresses[0].network).toBe(Network.testnet);
    expect(fundingAddresses[0].status).toBe(FundingAddressStatus.PENDING);

    await node1.fundingSubmissionService.executionCycle();
    fundingSubmission = await node1.db.fundingSubmissions.get(fundingSubmissionId);
    fundingAddresses = await node1.db.fundingAddresses.find({fundingSubmissionId});
    expect(fundingAddresses[0].balance).toBe(30000000);

    const exchange = await node1.db.exchanges.get(fundingSubmission.exchangeId);
    expect(exchange.currentFunds).toBe(30000000);
    expect(exchange.status).toBe(ExchangeStatus.AWAITING_DATA);
  });

  it('reset existing funding', async () => {
    const {fundingSubmissionId: initialSubmissionId, exchangeId} = await node1.createTestFundingSubmission(true, 0);

    let initialAddresses = await node1.db.fundingAddresses.findOne({
      fundingSubmissionId: initialSubmissionId,
    });
    expect(initialAddresses.status).toBe(FundingAddressStatus.PENDING);
    await node1.fundingSubmissionService.executionCycle();

    initialAddresses = await node1.db.fundingAddresses.get(initialAddresses._id);
    expect(initialAddresses.status).toBe(FundingAddressStatus.ACTIVE);

    // Create a second submission cancelling the original one
    const {fundingSubmissionId: newSubmissionId} = await node1.createTestFundingSubmission(true, 0);

    initialAddresses = await node1.db.fundingAddresses.get(initialAddresses._id);
    expect(initialAddresses.status).toBe(FundingAddressStatus.CANCELLED);

    await node1.fundingSubmissionService.executionCycle();

    initialAddresses = await node1.db.fundingAddresses.get(initialAddresses._id);
    expect(initialAddresses.status).toBe(FundingAddressStatus.CANCELLED);

    const newSubmissionAddresses = await node1.db.fundingAddresses.find({
      exchangeId: exchangeId,
      status: FundingAddressStatus.ACTIVE,
      fundingSubmissionId: newSubmissionId
    });

    expect(newSubmissionAddresses.length).toBe(1);
  });

  it('should update existing funding ', async () => {
    const {fundingSubmissionId: initialSubmissionId} = await node1.createTestFundingSubmission(true, 0);
    await node1.fundingSubmissionService.executionCycle();

    const initialAddresses = await node1.db.fundingAddresses.findOne({
      fundingSubmissionId: initialSubmissionId,
    });

    await node1.db.fundingAddresses.update(initialAddresses._id, {
      balance: 900000,
    })

    const {fundingSubmissionId: newSubmissionId} = await node1.createTestFundingSubmission(false, 0);
    await node1.fundingSubmissionService.executionCycle();

    const initialSubmissionAddress = await node1.db.fundingAddresses.get(initialAddresses._id);
    expect(initialSubmissionAddress.status).toBe(FundingAddressStatus.CANCELLED);

    const newSubmissionAddress = await node1.db.fundingAddresses.findOne({
      fundingSubmissionId: newSubmissionId,
      status: FundingAddressStatus.ACTIVE
    });

    expect(newSubmissionAddress.status).toBe(FundingAddressStatus.ACTIVE);
    expect(newSubmissionAddress.balance).toBe(30000000);
  });

  it('should add new funding', async () => {
    const {fundingSubmissionId: initialSubmissionId, exchangeId} = await node1.createTestFundingSubmission(true, 0);
    await node1.fundingSubmissionService.executionCycle();

    const {fundingSubmissionId: newSubmissionId} = await node1.createTestFundingSubmission(false, 1);

    const newAddress = await node1.db.fundingAddresses.findOne({ fundingSubmissionId: newSubmissionId})
    expect(newAddress.status).toBe(FundingAddressStatus.PENDING);

    await node1.fundingSubmissionService.executionCycle();

    const initialSubmissionAddresses = await node1.db.fundingAddresses.find({
      fundingSubmissionId: initialSubmissionId,
      status: FundingAddressStatus.CANCELLED
    });
    expect(initialSubmissionAddresses.length).toBe(0);

    const newSubmissionAddresses = await node1.db.fundingAddresses.find({
      exchangeId: exchangeId,
      status: FundingAddressStatus.ACTIVE
    });

    expect(newSubmissionAddresses.length).toBe(2);
  });

  it('failed to add funding from different network', async () => {
    await node1.createTestFundingSubmission(true, 0, { network: Network.mainnet });
    await expect(() => node1.createTestFundingSubmission(false, 1)).rejects.toThrow()
  });

  it('should fail', async () => {
    const {fundingSubmissionId} = await node1.createTestFundingSubmission(true, 0);
    let address = await node1.db.fundingAddresses.findOne({ fundingSubmissionId})

    await node1.db.fundingAddresses.update(address._id, {
      message: 'fail-me'
    })

    await node1.fundingSubmissionService.executionCycle();
    address = await node1.db.fundingAddresses.findOne({ fundingSubmissionId})
    expect(address.status).toBe(FundingAddressStatus.FAILED);
    expect(address.failureMessage).toBe('Block does not exist');
  });

});
