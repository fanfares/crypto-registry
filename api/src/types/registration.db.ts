import { DatabaseRecord } from './db.types';

export enum ApprovalStatus {
  approved = 'approved',
  rejected = 'rejected',
  inProgress = 'in-progress'
}

export class ApprovalBase {
  approverEmail: string;
  approverName: string;
  status: ApprovalStatus;
  approvalForRegistrationId: string;
  approverRegistrationId: string;
}

export class ApprovalRecord
  extends ApprovalBase
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export class RegistrationDb {
  email: string;
  name: string;
  status: ApprovalStatus;
  verified: boolean;
}

export class RegistrationRecord
  extends RegistrationDb
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
