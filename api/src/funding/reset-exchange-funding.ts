import { DbService } from '../db/db.service';
import { FundingSubmissionStatus } from '@bcr/types';
import { FundingAddressStatus } from '../types/funding-address.type';

export async function resetExchangeFunding(
  exchangeId: string,
  db: DbService
) {
  await db.fundingSubmissions.updateMany({
    exchangeId: exchangeId,
    status: {
      $in: [
        FundingSubmissionStatus.PROCESSING,
        FundingSubmissionStatus.WAITING_FOR_PROCESSING,
        FundingSubmissionStatus.ACCEPTED
      ]
    }
  }, {
    status: FundingSubmissionStatus.CANCELLED
  });

  await db.fundingAddresses.updateMany({
    exchangeId: exchangeId,
    status: {
      $in: [
        FundingSubmissionStatus.PROCESSING,
        FundingSubmissionStatus.WAITING_FOR_PROCESSING,
        FundingSubmissionStatus.ACCEPTED
      ]
    }
  }, {
    status: FundingAddressStatus.CANCELLED
  });
}
