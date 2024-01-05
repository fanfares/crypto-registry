import { ExchangeStatus, Network } from '@bcr/types';
import { TEST_CUSTOMER_EMAIL, TestNetwork, TestNode } from '../testing';
import { getHash } from '../utils';

describe('holdings-submission-service', () => {
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

  it('create holdings submission', async () => {
    const testExchangeId = await node1.getTestExchangeId();
    const id = await node1.holdingsSubmissionService.createSubmission(
      testExchangeId,
      [{
        hashedEmail: getHash(TEST_CUSTOMER_EMAIL, node1.apiConfigService.hashingAlgorithm),
        amount: 10000000
      }, {
        hashedEmail: getHash('customer-2@mail.com', node1.apiConfigService.hashingAlgorithm),
        amount: 20000000
      }]
    );

    const submission = await node1.db.holdingsSubmissions.get(id);
    expect(submission.totalHoldings).toBe(30000000);

    const exchange = await node1.db.exchanges.get(submission.exchangeId);
    expect(exchange.currentHoldings).toBe(30000000);
    expect(exchange.status).toBe(ExchangeStatus.AWAITING_DATA);
  });

  it('should manage isCurrent flag', async () => {
    const previousId = await node1.createTestHoldingsSubmission();
    let previous = await node1.db.holdingsSubmissions.get(previousId);
    expect(previous.isCurrent).toBe(true)

    let previousHolding = await node1.db.holdings.findOne({holdingsSubmissionId: previousId})
    expect(previousHolding.isCurrent).toBe(true);

    const currentId = await node1.createTestHoldingsSubmission();
    const current = await node1.db.holdingsSubmissions.get(currentId);
    expect(current.isCurrent).toBe(true);

    const currentHolding = await node1.db.holdings.findOne({holdingsSubmissionId: currentId })
    expect(currentHolding.isCurrent).toBe(true);

    previous = await node1.db.holdingsSubmissions.get(previousId);
    expect(previous.isCurrent).toBe(false);

    previousHolding = await node1.db.holdings.findOne({holdingsSubmissionId: previousId})
    expect(previousHolding.isCurrent).toBe(false);
  });
});
