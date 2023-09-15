import { SyncRequestMessage } from '@bcr/types';
import { Logger } from '@nestjs/common';

export const candidateIsMissingData = (
  relativeTo: SyncRequestMessage,
  candidate: SyncRequestMessage,
  logger: Logger
) => {
  const isMissingData =  relativeTo.latestSubmissionId > candidate.latestSubmissionId
    || relativeTo.latestSubmissionId !== null && candidate.latestSubmissionId === null
    || relativeTo.latestVerificationId > candidate.latestVerificationId
    || relativeTo.latestVerificationId !== null && candidate.latestVerificationId === null
    || relativeTo.testnetRegistryWalletAddressCount > candidate.testnetRegistryWalletAddressCount
    || relativeTo.mainnetRegistryWalletAddressCount > candidate.mainnetRegistryWalletAddressCount

  if ( isMissingData) {
    if (relativeTo.latestSubmissionId > candidate.latestSubmissionId || relativeTo.latestSubmissionId !== null && candidate.latestSubmissionId === null) {
      logger.log(candidate.address + ' is missing submissions')
    }
    if ( relativeTo.latestVerificationId > candidate.latestVerificationId || relativeTo.latestVerificationId !== null && candidate.latestVerificationId === null) {
      logger.log(candidate.address + ' is missing verifications')
    }
    if ( relativeTo.testnetRegistryWalletAddressCount > candidate.testnetRegistryWalletAddressCount) {
      logger.log(candidate.address + ' is missing testnet addresses')
    }
    if ( relativeTo.mainnetRegistryWalletAddressCount > candidate.mainnetRegistryWalletAddressCount) {
      logger.log(candidate.address + ' is missing mainnet addresses')
    }
  }

  return isMissingData
};
