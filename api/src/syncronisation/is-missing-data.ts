import { SyncRequestMessage } from '@bcr/types';

export const isMissingData = (remoteNodeStatus: SyncRequestMessage, thisNodeStatus: SyncRequestMessage) => {
  return remoteNodeStatus.latestSubmissionIndex > thisNodeStatus.latestSubmissionIndex
    || remoteNodeStatus.latestVerificationIndex > thisNodeStatus.latestVerificationIndex
    || remoteNodeStatus.testnetRegistryWalletAddressCount > thisNodeStatus.testnetRegistryWalletAddressCount
    || remoteNodeStatus.mainnetRegistryWalletAddressCount > thisNodeStatus.mainnetRegistryWalletAddressCount
};
