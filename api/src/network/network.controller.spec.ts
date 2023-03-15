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

  afterEach(async () => {
    await node1.module.close();
    await node2.module.close();
    await node3.module.close();
    await node4.module.close();
  });

  test('merge networks', async () => {
    await node1.addNodes([node2]);
    await node2.addNodes([node1, node3]);
    await node3.addNodes([node2, node4]);
    await node4.addNodes([node3]);

    await node1.senderService.broadcastNodeList();
    await node2.senderService.broadcastNodeList();
    await node3.senderService.broadcastNodeList();
    await node4.senderService.broadcastNodeList();

    await node1.senderService.broadcastNodeList();
    await node2.senderService.broadcastNodeList();
    await node3.senderService.broadcastNodeList();
    await node4.senderService.broadcastNodeList();

    await node1.senderService.broadcastNodeList();
    await node2.senderService.broadcastNodeList();
    await node3.senderService.broadcastNodeList();
    await node4.senderService.broadcastNodeList();

    const node1Nodes = await node1.nodeService.getNodeDtos();
    expect(node1Nodes.length).toBe(4);

    const node2Nodes = await node2.nodeService.getNodeDtos();
    expect(node2Nodes.length).toBe(4);

    const node3Nodes = await node3.nodeService.getNodeDtos();
    expect(node3Nodes.length).toBe(4);

    const node4Nodes = await node3.nodeService.getNodeDtos();
    expect(node4Nodes.length).toBe(4);
  });


});
