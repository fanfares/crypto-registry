import { DbService } from '../db/db.service';
import { HoldingBase } from '@bcr/types';
import { getHash } from '../utils';

export const createTestHoldings = async (
  db: DbService,
  numberOfHoldings: number
) => {
  const exchanges = await db.exchanges.find({});

  const holdingInserts: HoldingBase[] = [];

  for (const exchange of exchanges) {
    const submissionId = await db.holdingsSubmissions.insert({
      exchangeId: exchange._id,
      totalHoldings: numberOfHoldings * 10000,
      isCurrent: true,
    });

    for (let i = 0; i < numberOfHoldings; i++) {

      let hashedEmail = 'any';
      if (i === 0) {
        hashedEmail = getHash('robert.porter1@gmail.com', 'sha256');
      }

      holdingInserts.push({
        isCurrent: true,
        exchangeId: exchange._id,
        holdingsSubmissionId: submissionId,
        amount: i * 10000,
        hashedEmail: hashedEmail
      });
    }
  }

  if (holdingInserts.length > 0) {
    await db.holdings.insertMany(holdingInserts);
  }

};
