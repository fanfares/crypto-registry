import { TestNode } from "../testing";
import { SubmissionBase } from "@bcr/types";
import { ObjectId } from "mongodb";

describe('db-api', () => {

  let node: TestNode
  beforeAll(async () => {
    node = await TestNode.createTestNode(0)
  })

  test('specify id', async () => {
    const id = (new ObjectId()).toString()
    await node.db.submissions.insert({
      exchangeName: 'Test Co'
    } as SubmissionBase, {
      _id: id
    });

    const submission = await node.db.submissions.get(id);
    expect(submission.exchangeName).toBe('Test Co')
  })
})
