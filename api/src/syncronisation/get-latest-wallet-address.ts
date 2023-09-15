import { DbService } from '../db/db.service';

export const getLatestWalletAddress = (dbService: DbService) => {
  return dbService.walletAddresses.find({}, {
    sort: {
      index: -1
    },
    limit: 1
  })[0];
};
