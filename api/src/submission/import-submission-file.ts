import * as Buffer from 'buffer';
import * as stream from 'stream';

import * as csv from 'csv-parser';
import { CustomerHoldingDto, SubmissionStatusDto } from '@bcr/types';
import { SubmissionService } from './submission.service';

export const importSubmissionFile = async (
  buffer: Buffer,
  exchangeService: SubmissionService,
  exchangeName: string
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
          amount: csvRow.amount
        });
      }).on('end', async () => {
        if (customerHoldings.length > 0) {
          try {
            const submissionStatus = await exchangeService.submitHoldings({
              customerHoldings: customerHoldings,
              exchangeName: exchangeName
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
