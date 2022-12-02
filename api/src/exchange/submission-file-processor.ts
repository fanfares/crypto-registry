import * as Buffer from 'buffer';
import * as stream from 'stream';

import * as csv from 'csv-parser';
import { CustomerHolding } from '@bcr/types';
import { ExchangeService } from './exchange.service';

export const importSubmissionFile = async (
  buffer: Buffer,
  exchangeService: ExchangeService,
): Promise<void> => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const inserts: CustomerHolding[] = [];

  return new Promise<void>((resolve, reject) => {
    bufferStream.pipe(
      csv({
        headers: ['publicKey', 'email', 'amount'],
        skipLines: 1,
      })
        .on('data', function (csvrow) {
          inserts.push({
            hashedEmail: csvrow.email,
            amount: csvrow.amount,
            exchangeKey: csvrow.publicKey,
          });

          console.log(csvrow);
        })
        .on('end', function () {
          if (inserts.length > 0) {
            try {
              exchangeService.submitHoldings(inserts);
            } catch (err) {
              reject(err);
            }
          }

          resolve();
        }),
    );
  });
};
