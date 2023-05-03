import { TestNode } from "../testing";
import { TestNetwork } from "../testing";

describe('sync-service', () => {
  let node1: TestNode;
  let node2: TestNode;
  let network: TestNetwork;

  afterAll(async () => {
    await network.destroy();
  });

  beforeAll(async () => {
    network = await TestNetwork.create(3);
    node1 = network.getNode(1);
    node2 = network.getNode(2);
  });

  beforeEach(async () => {
    await network.reset();
    await network.setLeader(node1.address);
    await node1.createTestSubmission({ completeSubmission: true});
  });

  test('startup', async () => {
    const node1nodes = await node1.db.nodes.find({});
    node1nodes.forEach(node => {
      expect(node.isStarting).toBe(true)
      expect(node.unresponsive).toBe(false)
    })

  })

});
