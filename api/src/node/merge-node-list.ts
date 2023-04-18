import { NodeDto } from '@bcr/types';

export const mergeNodeList = (
  list1: NodeDto[],
  list2: NodeDto[]
) => {
  return list1.reduce((merged, node) => {
    const found = merged.find(mergedNode => mergedNode.address === node.address)
    if (!found) {
      merged.push(node)
    }
    return merged;
  }, [...list2])
}
