import { SyncRequestMessage } from '@bcr/types';
import { Logger } from '@nestjs/common';

export const candidateIsMissingData = (
  relativeTo: SyncRequestMessage,
  candidate: SyncRequestMessage,
  logger: Logger
) => {
  const isMissingData =  relativeTo.latestSubmissionId > candidate.latestSubmissionId
    || !!relativeTo.latestSubmissionId && !candidate.latestSubmissionId
    || relativeTo.latestVerificationId > candidate.latestVerificationId
    || !!relativeTo.latestVerificationId && !candidate.latestVerificationId

  if ( isMissingData) {
    if (relativeTo.latestSubmissionId > candidate.latestSubmissionId || !!relativeTo.latestSubmissionId && !candidate.latestSubmissionId ) {
      logger.log(candidate.address + ' is missing submissions')
    }
    if ( relativeTo.latestVerificationId > candidate.latestVerificationId || !!relativeTo.latestVerificationId && !candidate.latestVerificationId) {
      logger.log(candidate.address + ' is missing verifications')
    }
  }

  return isMissingData
};
