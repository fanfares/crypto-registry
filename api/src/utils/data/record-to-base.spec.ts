import { NodeBase, NodeRecord } from '@bcr/types';
import { ObjectId } from 'mongodb';
import { recordToBase } from './record-to-dto';

describe('record to base', () => {
  test('record to base', () => {
    const node: NodeRecord = {
      _id: new ObjectId(),
      createdDate: new Date(),
      updatedDate: new Date(),
      address: 'address'
    } as unknown as NodeRecord;

    const nodes = [node].map(recordToBase<NodeBase, NodeRecord>);
    expect(nodes[0].address).toBe('address');
    expect(nodes[0]['_id']).toBeUndefined();
  });
});
