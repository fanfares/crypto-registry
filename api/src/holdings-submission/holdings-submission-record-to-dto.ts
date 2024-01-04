import { HoldingRecord, HoldingsSubmissionDto, HoldingsSubmissionsRecord } from '@bcr/types';

export const holdingsSubmissionStatusRecordToDto = (
  submission: HoldingsSubmissionsRecord,
  holdings: HoldingRecord[]
): HoldingsSubmissionDto => {
  return {
    ...submission,
    holdings: holdings
  };
};
