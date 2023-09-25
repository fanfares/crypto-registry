import { DatabaseRecord } from './db.types';

export enum SubmissionConfirmationStatus {
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export class SubmissionConfirmationBase {
  nodeAddress: string;
  submissionId: string;
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
  confirmed: boolean;
}
