import * as Buffer from 'buffer';
import * as stream from 'stream';
import { CustodianDbService } from './custodian-db.service';

import * as csv from 'csv-parser';
import { CustomerHoldingBase } from '@bcr/types';
import { CustomerHoldingsDbService } from '../customer';

export const importSubmissionFile = async (
  buffer: Buffer,
  custodianDbService: CustodianDbService,
  customerHoldingsDbService: CustomerHoldingsDbService
): Promise<void> => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const inserts: CustomerHoldingBase[] = [];
  const custodians = await custodianDbService.find({});

  return new Promise<void>((resolve) => {
    bufferStream.pipe(csv({
      headers: ['publicKey', 'email', 'amount'],
      skipLines: 1
    }).on('data', function(csvrow) {

      const custodian = custodians.find(c => c.publicKey === csvrow.publicKey);

      inserts.push({
        hashedEmail: csvrow.email,
        amount: csvrow.amount,
        custodianId: custodian._id
      });

      console.log(csvrow);
    }).on('end', function() {

      if (inserts.length > 0) {
        customerHoldingsDbService.insertMany(inserts, {type: 'custodian', id: 'tbc'});
      }

      resolve();
    }));
  });
};
