import { NodeRecord, SyncRequestMessage } from '@bcr/types';

export const isMissingData = (syncRequest: SyncRequestMessage, node: NodeRecord) => {
  return syncRequest.latestSubmissionIndex > node.latestSubmissionIndex || syncRequest.latestVerificationIndex > node.latestSubmissionIndex;
}
