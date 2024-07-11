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
      exchangeId,
      signedAddress,
      message,
      address
    } = await node1.createTestFundingSubmission(true, 0);

    let fundingAddresses = await node1.db.fundingAddresses.find({exchangeId});
    expect(fundingAddresses[0].address).toBe(address);
    expect(fundingAddresses[0].signature).toBe(signedAddress.signature);
    expect(fundingAddresses[0].balance).toBeUndefined();
    expect(fundingAddresses[0].message).toBe(message);
    expect(fundingAddresses[0].network).toBe(Network.testnet);
    expect(fundingAddresses[0].status).toBe(FundingAddressStatus.PENDING);

    await node1.fundingSubmissionService.executionCycle();
    fundingAddresses = await node1.db.fundingAddresses.find({exchangeId});
    expect(fundingAddresses[0].balance).toBe(30000000);

    const exchange = await node1.db.exchanges.get(fundingAddresses[0].exchangeId);
    expect(exchange.currentFunds).toBe(30000000);
    expect(exchange.status).toBe(ExchangeStatus.AWAITING_DATA);
  });

  it('reset existing funding', async () => {
    const {exchangeId} = await node1.createTestFundingSubmission(true, 0);

    let initialAddresses = await node1.db.fundingAddresses.findOne({exchangeId});
    expect(initialAddresses.status).toBe(FundingAddressStatus.PENDING);
    await node1.fundingSubmissionService.executionCycle();

    initialAddresses = await node1.db.fundingAddresses.get(initialAddresses._id);
    expect(initialAddresses.status).toBe(FundingAddressStatus.ACTIVE);

    // Create a second submission cancelling the original one
    await node1.createTestFundingSubmission(true, 0);

    initialAddresses = await node1.db.fundingAddresses.findOne({ address: initialAddresses.address });
    expect(initialAddresses.status).toBe(FundingAddressStatus.PENDING);

    await node1.fundingSubmissionService.executionCycle();

    initialAddresses = await node1.db.fundingAddresses.findOne({ address: initialAddresses.address });
    expect(initialAddresses.status).toBe(FundingAddressStatus.ACTIVE);

    const newSubmissionAddresses = await node1.db.fundingAddresses.find({
      exchangeId: exchangeId,
      status: FundingAddressStatus.ACTIVE
    });

    expect(newSubmissionAddresses.length).toBe(1);
  });

  it('should update existing funding ', async () => {
    const {exchangeId} = await node1.createTestFundingSubmission(true, 0);
    await node1.fundingSubmissionService.executionCycle();

    const initialAddresses = await node1.db.fundingAddresses.findOne({exchangeId});

    await node1.db.fundingAddresses.update(initialAddresses._id, {
      balance: 900000
    });

    await node1.createTestFundingSubmission(false, 0);
    await node1.fundingSubmissionService.executionCycle();

    const initialSubmissionAddress = await node1.db.fundingAddresses.get(initialAddresses._id);
    expect(initialSubmissionAddress.status).toBe(FundingAddressStatus.ACTIVE);

    const newSubmissionAddress = await node1.db.fundingAddresses.findOne({
      exchangeId: exchangeId,
      status: FundingAddressStatus.ACTIVE
    });

    expect(newSubmissionAddress.status).toBe(FundingAddressStatus.ACTIVE);
    expect(newSubmissionAddress.balance).toBe(30000000);
  });

  it('should add new funding', async () => {
    const {exchangeId} = await node1.createTestFundingSubmission(true, 0);
    await node1.fundingSubmissionService.executionCycle();
    let originalFundingAddress = await node1.db.fundingAddresses.findOne({});

    await node1.createTestFundingSubmission(false, 1);

    const addresses = await node1.db.fundingAddresses.find({exchangeId});
    const newAddress = addresses.find(a => a.status === FundingAddressStatus.PENDING);
    expect(newAddress).toBeDefined();

    await node1.fundingSubmissionService.executionCycle();

    originalFundingAddress = await node1.db.fundingAddresses.get(originalFundingAddress._id);
    expect(originalFundingAddress.status).toBe(FundingAddressStatus.ACTIVE);

    const finalAddresses = await node1.db.fundingAddresses.find({
      exchangeId: exchangeId,
      status: FundingAddressStatus.ACTIVE
    });

    expect(finalAddresses.length).toBe(2);
  });

  it('failed to add funding from different network', async () => {
    await node1.createTestFundingSubmission(true, 0, {network: Network.mainnet});
    await expect(() => node1.createTestFundingSubmission(false, 1)).rejects.toThrow();
  });

  it('should fail', async () => {
    const {exchangeId} = await node1.createTestFundingSubmission(true, 0);
    let address = await node1.db.fundingAddresses.findOne({exchangeId});

    await node1.db.fundingAddresses.update(address._id, {
      message: 'fail-me'
    });

    await node1.fundingSubmissionService.executionCycle();
    address = await node1.db.fundingAddresses.findOne({exchangeId});
    expect(address.status).toBe(FundingAddressStatus.FAILED);
    expect(address.failureMessage).toBe('Block does not exist');
  });

});
