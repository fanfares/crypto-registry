import { FundingSubmissionDto, FundingSubmissionRecord } from '@bcr/types';

export const fundingSubmissionStatusRecordToDto = (
  submission: FundingSubmissionRecord
): FundingSubmissionDto => {
  return {
    ...submission
  };
};
