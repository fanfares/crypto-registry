import { DbService } from '../db/db.service';

export const getLatestVerificationBlock = async (db: DbService ) =>{
  return await db.verifications.findOne({
  }, {
    sort: {
      index:-1
    },
    limit: 1
  })

}
