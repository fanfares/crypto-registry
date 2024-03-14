import { DbService } from '../db/db.service';
import { VerificationStatus } from '@bcr/types';

export const getLatestVerification = async (db: DbService) => {
  return await db.verifications.findOne({
    status: VerificationStatus.SUCCESS
  }, {
    sort: {
      _id: -1
    },
    limit: 1
  })

}
