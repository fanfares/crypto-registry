import { DatabaseRecord } from './db.types';

export class SubmissionConfirmation {
  nodeAddress: string;
  submissionId: string;
  confirmed: boolean;
}

export class SubmissionConfirmationRecord
  extends SubmissionConfirmation
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
