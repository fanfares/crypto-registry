import { DatabaseRecord } from './db.types';
import { UserIdentity } from './user-identity.types';
import { SubmissionStatus } from './submission-dto.types';

export class Submission {
  paymentAddress: string;
  paymentAmount: number;
  totalCustomerFunds: number;
  totalExchangeFunds: number;
  status: SubmissionStatus;
  exchangeName: string;
  exchangeZpub: string;
}

export class SubmissionRecord extends Submission implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
  updatedBy: UserIdentity;
  createdBy: UserIdentity;
}
