import { TestNode } from "../testing";
import { NodeBase } from '@bcr/types'
import * as getCurrentNodeForHashModule from './get-current-node-for-hash'

describe('node-service', () => {

  let node: TestNode;
  const currentNodeSpy = jest.spyOn(getCurrentNodeForHashModule, 'getCurrentNodeForHash')

  beforeAll(async () => {
    node = await TestNode.createTestNode(0)
  })

  afterAll(async () => {
    await node.destroy()
  })

  describe('basic leader selection', () => {

    beforeEach(async () => {
      await node.reset()

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
      expect(await node.nodeService.getLeaderAddress()).toBe('a')
    });
  })

  describe('leader is behind, so dont vote for yourself', () => {

    beforeEach(async () => {
      await node.reset()

      await node.db.nodes.update(node.nodeService.thisNodeId, {
        address: 'a',
        leaderVote: '',
      })

      await node.db.nodes.insertMany([{
        address: 'b',
        leaderVote: 'b',
        unresponsive: false,
        blackBalled: false,
      }, {
        address: 'c',
        leaderVote: 'b',
        unresponsive: false,
        blackBalled: false,
      }] as NodeBase[]);
    })

    test('exclude this node from eligible leaders', async () => {
      currentNodeSpy.mockReturnValue(1); // i.e. b
      const eligibleNodes = await node.nodeService.getEligibleNodes();

      // A is behind, so not eligible.
      const includesThisNode = !!eligibleNodes.find(n => n.nodeName === 'a')
      expect(includesThisNode).toBe(false);

      await node.nodeService.updateLeader();
      const thisNode = await node.db.nodes.findOne({address: 'a'})
      const nodeB = await node.db.nodes.findOne({address: 'b'})
      const nodeC = await node.db.nodes.findOne({address: 'c'})

      expect(thisNode.leaderVote).toBe('b');
      expect(nodeB.leaderVote).toBe('b');
      expect(nodeC.leaderVote).toBe('b');

      expect(thisNode.isLeader).toBe(false);
      expect(nodeB.isLeader).toBe(true);
      expect(nodeC.isLeader).toBe(false);


    })
  })

})
