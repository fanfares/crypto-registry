import { SubmissionRecord } from '@bcr/types';
import { DbService } from '../db/db.service';

export const getLatestSubmission = async (
  db: DbService
): Promise<SubmissionRecord> => {
  return await db.submissions.findOne({}, {
    sort: {
      _id: -1
    },
    limit: 1
  })
}
