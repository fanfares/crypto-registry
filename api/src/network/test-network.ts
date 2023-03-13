import { TestDataOptions } from '../testing';
import { TestNode } from './test-node';

export class TestNetwork {

  nodes: TestNode[] = [];

  static async create(numberOfNodes: number, options?: TestDataOptions): Promise<TestNetwork> {
    const network = new TestNetwork();
    const nodes = network.nodes;
    for (let i = 1; i <= numberOfNodes; i++) {
      const newNode = await TestNode.createTestNode(i, options);
      if ( nodes.length > 0 ) {
        await newNode.addNodes(nodes)
      }
      for (const node of nodes) {
        await node.addNodes([newNode]);
      }
      nodes.push(newNode);
    }
    return network;
  }

  getNode(nodeNumber: number): TestNode {
    return this.nodes[nodeNumber - 1];
  }


}
