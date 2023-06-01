import { TestNode, TestSubmissionOptions } from './test-node';

export class TestNetwork {

  testNodes: TestNode[] = [];

  async reset(autoStart = true) {
    for (let i = 0; i < this.testNodes.length; i++) {
      await this.testNodes[i].reset(autoStart);
    }

    for (let i = 0; i < this.testNodes.length; i++) {
      await this.testNodes[i].addNodes(this.testNodes);
    }
  }

  async destroy() {
    for (let i = 0; i < this.testNodes.length; i++) {
      await this.testNodes[i].destroy()
    }
  }

  static async create(numberOfNodes: number, options?: {
    useStartMode?: boolean
  }): Promise<TestNetwork> {
    const network = new TestNetwork();
    const nodes = network.testNodes;
    for (let i = 1; i <= numberOfNodes; i++) {
      const newNode = await TestNode.createTestNode(i, options);
      if (nodes.length > 0) {
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
    return this.testNodes[nodeNumber - 1];
  }

  async setLeader(address: string) {
    for (const testNode of this.testNodes) {
      await testNode.setLeader(address)
    }
  }

  async getFollowers() {
    const followers: TestNode[] = [];
    for (const testNode of this.testNodes) {
      if (!await testNode.isLeader()) {
        followers.push(testNode)
      }
    }
    return followers
  }

  async execSubmissionCycle() {
    for (const testNode of this.testNodes) {
      await testNode.submissionService.executionCycle();
    }
  }

  async createTestSubmission(
    receivingNode: TestNode,
    options?: TestSubmissionOptions
  ): Promise<string> {
    const optionsToUse: TestSubmissionOptions = options ?? {
      sendPayment: true,
      additionalSubmissionCycles: 1
    };

    const ret = await receivingNode.createTestSubmission(optionsToUse);

    for (let i = 0; i < optionsToUse.additionalSubmissionCycles; i++) {
      for (const testNode of this.testNodes) {
        await testNode.submissionService.executionCycle();
      }
    }

    return ret;
  }

  async printStatus() {
    for (const testNode of this.testNodes) {
      await testNode.printStatus()
    }
  }

}
