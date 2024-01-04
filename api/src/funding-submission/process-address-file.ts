import * as Buffer from 'buffer';
import * as stream from 'stream';

import csv from 'csv-parser';
import { CreateRegisteredAddressDto } from '@bcr/types';

export const processAddressFile = async (
  buffer: Buffer
): Promise<CreateRegisteredAddressDto[]> => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const signedAddresses: CreateRegisteredAddressDto[] = [];

  return new Promise<CreateRegisteredAddressDto[]>((resolve, reject) => {
    bufferStream.pipe(
      csv({
        headers: ['address', 'signature'],
        skipLines: 1
      }).on('data', csvRow => {
        signedAddresses.push({
          address: csvRow.address,
          signature: csvRow.signature
        });
      }).on('end', async () => {
        resolve(signedAddresses);
      }).on('error', () => {
        reject('Error parsing CSV file');
      })
    );
  });
};
