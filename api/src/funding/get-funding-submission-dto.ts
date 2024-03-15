import { FundingSubmissionDto } from '@bcr/types';
import { DbService } from '../db/db.service';

export const getFundingSubmissionDto = async (
  fundingSubmissionId: string,
  dbService: DbService
): Promise<FundingSubmissionDto> => {
  return await dbService.fundingSubmissions.get(fundingSubmissionId);
};
