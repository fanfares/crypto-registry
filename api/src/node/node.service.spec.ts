import { TestNode } from "../network/test-node";
import { NodeBase } from '@bcr/types'
import * as getCurrentNodeForHashModule from './get-current-node-for-hash'

describe('node-service', () => {

  let node: TestNode;
  const currentNodeSpy = jest.spyOn(getCurrentNodeForHashModule, 'getCurrentNodeForHash')

  beforeEach(async () => {
    node = await TestNode.createTestNode(0)

    await node.db.nodes.update(node.nodeService.thisNodeId, {
      address: 'a',
      leaderVote: ''
    })

    await node.db.nodes.insertMany([{
      address: 'b',
      leaderVote: 'b',
      unresponsive: false,
      blackBalled: false
    }, {
      address: 'c',
      leaderVote: 'b',
      unresponsive: false,
      blackBalled: false
    }] as NodeBase[]);
  })

  test('100% votes for b', async () => {
    currentNodeSpy.mockReturnValue(1)
    await node.nodeService.updateLeader();
    expect((await node.nodeService.getThisNode()).leaderVote).toBe('b')
  })

  test('2 of 3 vote for b', async () => {
    await node.db.nodes.updateMany({_id: {$ne: node.nodeService.thisNodeId}}, {
      leaderVote: 'a'
    })
    currentNodeSpy.mockReturnValue(1); // i.e. b
    await node.nodeService.updateLeader();
    expect((await node.nodeService.getLeader()).address).toBe('a')
  })

})
