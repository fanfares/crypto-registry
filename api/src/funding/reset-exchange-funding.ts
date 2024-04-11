import { DbService } from '../db/db.service';
import { FundingAddressStatus } from '../types/funding-address.type';

export async function resetExchangeFunding(
  exchangeId: string,
  db: DbService
) {
  await db.fundingAddresses.updateMany({
    exchangeId: exchangeId,
    status: {
      $in: [
        FundingAddressStatus.ACTIVE,
        FundingAddressStatus.PENDING,
      ]
    }
  }, {
    status: FundingAddressStatus.CANCELLED
  });
}
