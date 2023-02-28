import { TestNode } from './test-node';

describe('network controller', () => {

  let node1: TestNode;
  let node2: TestNode;
  let node3: TestNode;
  let node4: TestNode;

  beforeEach(async () => {
    node1 = await TestNode.createTestNode(1);
    node2 = await TestNode.createTestNode(2);
    node3 = await TestNode.createTestNode(3);
    node4 = await TestNode.createTestNode(4);
  });

  test('merge networks', async () => {
    const node2Dto = await node2.nodeService.getLocalNode();
    await node1.senderService.sendDiscoverMessage(
      [node2Dto]
    );

    const node1Nodes = await node1.nodeService.getNodeDtos();
    expect(node1Nodes.length).toBe(2)

    const node2Nodes = await node2.nodeService.getNodeDtos();
    expect(node2Nodes.length).toBe(2)
  });


});
