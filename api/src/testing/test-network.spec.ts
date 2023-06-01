import { TestNode } from "./test-node";
import { TestNetwork } from "./test-network";
import { SubmissionStatus } from "@bcr/types";

describe('test-network', () => {
  let node1: TestNode;
  let node2: TestNode;
  let network: TestNetwork;

  afterAll(async () => {
    await node1.destroy();
  });

  describe('nodes are auto started', () => {
    beforeAll(async () => {
      network = await TestNetwork.create(2);
      node1 = network.getNode(1);
      node2 = network.getNode(2);
    });

    beforeEach(async () => {
      await network.reset();
      await network.setLeader(node1.address);
      await network.createTestSubmission(node1, {
        sendPayment: true,
        additionalSubmissionCycles: 4
      });
    });


    test('test nodes are started', async () => {
      expect(await node1.nodeService.isThisNodeStarting()).toBe(false)
      expect(await node2.nodeService.isThisNodeStarting()).toBe(false)
    })

    test('test submission is confirmed', async () => {
      const submission1 = await node1.db.submissions.findOne({})
      expect(submission1.status).toBe(SubmissionStatus.CONFIRMED)
      const submission2 = await node2.db.submissions.findOne({})
      expect(submission2.status).toBe(SubmissionStatus.CONFIRMED)
    })
  })

  describe('test nodes are starting', () => {
    beforeAll(async () => {
      network = await TestNetwork.create(2, { useStartMode: true});
      node1 = network.getNode(1);
      node2 = network.getNode(2);
    });

    test('test nodes are starting', async () => {
      expect(await node1.nodeService.isThisNodeStarting()).toBe(true)
      expect(await node1.nodeService.isThisNodeStarting()).toBe(true)
    })
  })

})
