import { SyncRequestMessage } from '@bcr/types';

export const isMissingData = (syncRequest: SyncRequestMessage, thisNodeSyncRequest: SyncRequestMessage) => {
  return syncRequest.latestSubmissionIndex > thisNodeSyncRequest.latestSubmissionIndex
    || syncRequest.latestVerificationIndex > thisNodeSyncRequest.latestVerificationIndex
    || syncRequest.testnetRegistryWalletAddressCount > thisNodeSyncRequest.testnetRegistryWalletAddressCount
    || syncRequest.mainnetRegistryWalletAddressCount > thisNodeSyncRequest.mainnetRegistryWalletAddressCount
};
