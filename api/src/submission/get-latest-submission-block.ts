import { SubmissionRecord } from '@bcr/types';
import { DbService } from '../db/db.service';

export const getLatestSubmissionBlock = async (
  db: DbService
): Promise<SubmissionRecord> => {
  return await db.submissions.findOne({},{
    sort: {
      index: -1
    },
    limit: 1
  })
}
