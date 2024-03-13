import { DbService } from '../db/db.service';
import { FundingSubmissionBase, FundingSubmissionStatus, Network } from '@bcr/types';

export async function createTestFundingSubmissions(
  db: DbService,
  numberOfFundingSubmissions: number
) {
  const exchanges = await db.exchanges.find({});
  const submissions: FundingSubmissionBase[] = [];
  for (const exchange of exchanges) {
    for (let i = 0; i < numberOfFundingSubmissions; i++) {
      submissions.push({
        exchangeId: exchange._id,
        status: FundingSubmissionStatus.ACCEPTED,
        network: Network.testnet
      });
    }
  }
  if ( submissions.length ) {
    await db.fundingSubmissions.insertMany(submissions);
  }
}
