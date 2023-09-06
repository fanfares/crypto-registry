import { DbService } from '../db/db.service';

export const getLatestVerification = async (db: DbService) => {
  return await db.verifications.findOne({}, {
    sort: {
      _id: -1
    },
    limit: 1
  })

}
