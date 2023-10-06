import * as Buffer from 'buffer';
import * as stream from 'stream';

import csv from 'csv-parser';
import { SignedAddress } from '../crypto/bip84-utils';

export const processAddressFile = async (
  buffer: Buffer,
  message: string
): Promise<SignedAddress[]> => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const signedAddresses: SignedAddress[] = [];

  return new Promise<SignedAddress[]>((resolve, reject) => {
    bufferStream.pipe(
      csv({
        headers: ['address', 'signature'],
        skipLines: 1
      }).on('data', csvRow => {
        signedAddresses.push({
          address: csvRow.address,
          message,
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
