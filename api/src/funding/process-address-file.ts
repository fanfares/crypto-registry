import * as Buffer from 'buffer';
import * as stream from 'stream';

import csv from 'csv-parser';
import { CreateFundingAddressDto } from '@bcr/types';

export const processAddressFile = async (
  buffer: Buffer
): Promise<CreateFundingAddressDto[]> => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const signedAddresses: CreateFundingAddressDto[] = [];

  return new Promise<CreateFundingAddressDto[]>((resolve, reject) => {
    bufferStream.pipe(
      csv({
        mapHeaders: ({ header}) => header.toLowerCase().trim(),
        mapValues: ({ header, index, value }) => value.trim()
      }).on('headers', (headers: string[]) => {
        if ( !headers.includes('address') || !headers.includes('signature') || !headers.includes('message')) {
          reject('Invalid CSV Headers')
        }
      }).on('data', (csvRow) => {
        if ( !csvRow.address || !csvRow.signature || !csvRow.message ) {
          reject('Invalid CSV Record: ' + csvRow);
          return;
        }
        signedAddresses.push(csvRow);
      }).on('end', async () => {
        resolve(signedAddresses);
      }).on('error', () => {
        reject('Error parsing CSV file');
      })
    );
  });
};
