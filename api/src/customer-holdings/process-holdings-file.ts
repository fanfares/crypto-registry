import * as Buffer from 'buffer';
import * as stream from 'stream';

import csv from 'csv-parser';
import { CustomerHoldingDto } from '@bcr/types';

export const processHoldingsFile = async (
  buffer: Buffer
): Promise<CustomerHoldingDto[]> => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const customerHoldings: CustomerHoldingDto[] = [];

  return new Promise<CustomerHoldingDto[]>((resolve, reject) => {
    bufferStream.pipe(
      csv({
        mapHeaders: ({ header}) => header.toLowerCase().trim(),
        mapValues: ({ header, index, value }) => value.trim()
      }).on('headers', (headers: string[]) => {
        if ( !headers.includes('email') || !headers.includes('amount')) {
          reject('Invalid CSV Headers')
        }
      }).on('data', csvRow => {
        customerHoldings.push({
          hashedEmail: csvRow.email,
          amount: Number.parseInt(csvRow.amount),
          exchangeUid: csvRow.uid ?? null
        });
      }).on('end', async () => {
        resolve(customerHoldings);
      }).on('error', () => {
        reject('Error parsing CSV file');
      })
    );
  });
};
