import { DatabaseRecord } from './db.types';
import { SubmissionStatus } from './submission-dto.types';
import { Network } from '@bcr/types';

export class Submission {
  paymentAddress: string;
  network: Network;
  paymentAmount: number;
  totalCustomerFunds: number;
  totalExchangeFunds: number;
  status: SubmissionStatus;
  exchangeName: string;
  exchangeZpub: string;
  isCurrent: boolean;
}

export class SubmissionRecord extends Submission implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
