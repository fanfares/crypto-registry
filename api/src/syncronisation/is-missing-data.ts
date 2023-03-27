import { SyncRequestMessage } from '@bcr/types';

export const isMissingData = (syncRequest: SyncRequestMessage, thisNodeSyncRequest: SyncRequestMessage) => {
  return syncRequest.latestSubmissionIndex > thisNodeSyncRequest.latestSubmissionIndex || syncRequest.latestVerificationIndex > thisNodeSyncRequest.latestSubmissionIndex;
};
