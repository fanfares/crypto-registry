import { DbService } from './db.service';
import { FundingAddressBase, FundingAddressStatus } from '../types/funding-address.type';
import { BulkUpdate } from './db-api.types';

export const migrateDb = async (
  db: DbService
): Promise<string[]> => {

  const deletedCount = await db.fundingAddresses.deleteMany({
    status: {$ne: FundingAddressStatus.ACTIVE}
  });

  const activeAddresses = await db.fundingAddresses.find({
    status: FundingAddressStatus.ACTIVE
  });

  const updates: BulkUpdate<FundingAddressBase>[] = [];

  for (const address of activeAddresses) {
    updates.push({
      id: address._id,
      modifier: {
        signatureDate: address['validFromDate'],
        balanceDate: address['validFromDate']
      }
    });
  }

  let updateCount = 0;

  if (updates.length) {
    updateCount = await db.fundingAddresses.bulkUpdate(updates);
  }

  return [`Updated ${updateCount} addresses`, `Deleted ${deletedCount} addresses`];
};
