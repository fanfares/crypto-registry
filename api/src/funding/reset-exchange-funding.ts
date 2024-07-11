import { DbService } from '../db/db.service';

export async function resetExchangeFunding(
  exchangeId: string,
  db: DbService
) {
  await db.fundingAddresses.deleteMany({
    exchangeId: exchangeId
  });
}
