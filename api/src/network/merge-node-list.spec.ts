import { NodeDto } from '@bcr/types';
import { mergeNodeList } from './merge-node-list';

describe('merged-node-list', () => {
  test('merging', () => {
    const list1: NodeDto[] = [{
      address: 'address-1'
    }, {
      address: 'address-2'
    }] as NodeDto[];

    const list2: NodeDto[] = [{
      address: 'address-2'
    }, {
      address: 'address-3'
    }] as NodeDto[];

    const mergedList = mergeNodeList(list1, list2);
    expect(mergedList.length).toBe(3);

  });

});
