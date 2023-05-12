import { DatabaseRecord } from './db.types';

export enum SubmissionConfirmationStatus {
  RECEIVED_CONFIRMED = 'received-confirmed',
  RECEIVED_REJECTED = 'received-rejected',
  MATCHED = 'matched',
  MATCH_FAILED = 'match-failed'
}

export class SubmissionConfirmationBase {
  nodeAddress: string;
  submissionId: string;
  submissionHash: string
  status: SubmissionConfirmationStatus
}

export class SubmissionConfirmationRecord
  extends SubmissionConfirmationBase
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export class SubmissionConfirmationMessage {
  submissionId: string;
  submissionHash: string;
  confirmed: boolean;
}
