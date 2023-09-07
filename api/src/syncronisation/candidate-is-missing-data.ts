import { SyncRequestMessage } from '@bcr/types';

export const candidateIsMissingData = (relativeTo: SyncRequestMessage, candidate: SyncRequestMessage) => {
  return relativeTo.latestSubmissionId > candidate.latestSubmissionId
    || relativeTo.latestVerificationId > candidate.latestVerificationId
    || relativeTo.testnetRegistryWalletAddressCount > candidate.testnetRegistryWalletAddressCount
    || relativeTo.mainnetRegistryWalletAddressCount > candidate.mainnetRegistryWalletAddressCount
};
