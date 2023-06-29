import * as Buffer from 'buffer';
import * as stream from 'stream';

import csv from 'csv-parser';
import { CustomerHoldingDto, SubmissionDto } from '@bcr/types';
import { SubmissionService } from './submission.service';
import { MessageSenderService } from '../network/message-sender.service';

export const importSubmissionFile = async (
  buffer: Buffer,
  submissionService: SubmissionService,
  messageSenderService: MessageSenderService,
  exchangeZpub: string,
  exchangeName: string,
  initialNodeAddress: string
): Promise<SubmissionDto> => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const customerHoldings: CustomerHoldingDto[] = [];

  return new Promise<SubmissionDto>((resolve, reject) => {
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
            const submissionId = await submissionService.createSubmission({
              receiverAddress: initialNodeAddress,
              customerHoldings: customerHoldings,
              exchangeName: exchangeName,
              exchangeZpub: exchangeZpub
            });
            resolve(await submissionService.getSubmissionDto(submissionId));
          } catch (err) {
            reject(err);
          }
        }
        reject('No customer holdings provided');
      })
    );
  });
};
