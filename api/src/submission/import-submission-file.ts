import * as Buffer from 'buffer';
import * as stream from 'stream';

import csv from 'csv-parser';
import { CustomerHoldingDto, Network, SubmissionStatusDto } from '@bcr/types';
import { SubmissionService } from './submission.service';

export const importSubmissionFile = async (
  buffer: Buffer,
  submissionService: SubmissionService,
  exchangeZpub: string,
  exchangeName: string,
  network: Network
): Promise<SubmissionStatusDto> => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const customerHoldings: CustomerHoldingDto[] = [];

  return new Promise<SubmissionStatusDto>((resolve, reject) => {
    bufferStream.pipe(
      csv({
        headers: ['email', 'amount'],
        skipLines: 1
      }).on('data', csvRow => {
        customerHoldings.push({
          hashedEmail: csvRow.email,
          amount: Number.parseInt(csvRow.amount)
        });
      }).on('end', async () => {
        if (customerHoldings.length > 0) {
          try {
            const submissionStatus = await submissionService.createSubmission({
              customerHoldings: customerHoldings,
              exchangeName: exchangeName,
              exchangeZpub: exchangeZpub,
              network: network
            });
            resolve(submissionStatus);
          } catch (err) {
            reject(err);
          }
        }
        reject('No customer holdings provided');
      })
    );
  });
};
