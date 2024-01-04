import { TestNode } from '../testing';
import { ExchangeStatus, Network } from '@bcr/types';
import { ObjectId } from 'mongodb';

describe('db-api', () => {

  let node: TestNode
  beforeAll(async () => {
    node = await TestNode.createTestNode(0)
  })

  test('specify id', async () => {
    const id = (new ObjectId()).toString()
    await node.db.exchanges.insert({
      name: 'Test Co',
      currentHoldings: null,
      currentFunds: null,
      fundingSource: Network.testnet,
      status: ExchangeStatus.AWAITING_DATA,
    }, {
      _id: id
    });

    const submission = await node.db.exchanges.get(id);
    expect(submission.name).toBe('Test Co')
  })
})
