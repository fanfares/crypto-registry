import { HoldingRecord, HoldingsSubmissionDto, HoldingsSubmissionsRecord } from '@bcr/types';

export const holdingsSubmissionStatusRecordToDto = (
  submission: HoldingsSubmissionsRecord,
  holdings: HoldingRecord[]
): HoldingsSubmissionDto => {
  if ( !submission ) {
    return null
  }
  return {
    ...submission,
    holdings: holdings
  };
};
