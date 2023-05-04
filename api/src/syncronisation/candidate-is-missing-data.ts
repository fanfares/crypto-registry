import { SyncRequestMessage } from '@bcr/types';

export const candidateIsMissingData = (relativeTo: SyncRequestMessage, candidate: SyncRequestMessage) => {
  return relativeTo.latestSubmissionIndex > candidate.latestSubmissionIndex
    || relativeTo.latestVerificationIndex > candidate.latestVerificationIndex
    || relativeTo.testnetRegistryWalletAddressCount > candidate.testnetRegistryWalletAddressCount
    || relativeTo.mainnetRegistryWalletAddressCount > candidate.mainnetRegistryWalletAddressCount
};
