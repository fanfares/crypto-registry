import { DatabaseRecord } from './db.types';
import { UserIdentity } from './user-identity.types';
import { SubmissionStatus } from './submission-dto.types';

export class SubmissionBase {
  paymentAddress: string;
  paymentAmount?: number;
  totalCustomerFunds?: number;
  totalExchangeFunds?: number;
  submissionStatus: SubmissionStatus;
  exchangeName?: string;
}

export class SubmissionRecord extends SubmissionBase implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
  updatedBy: UserIdentity;
  createdBy: UserIdentity;
}
