import { FundingSubmissionDto, FundingSubmissionRecord } from '@bcr/types';
import { DbService } from '../db/db.service';

export const getFundingSubmissionDto = async (
  fundingSubmissionId: string,
  dbService: DbService
): Promise<FundingSubmissionDto> => {
  const submission = await dbService.fundingSubmissions.get(fundingSubmissionId);
  const addresses = await dbService.fundingAddresses.find({ fundingSubmissionId})
  return {
    ...submission,
    addresses: addresses
  };
};
