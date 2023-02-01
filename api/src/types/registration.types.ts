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
}

export class ApprovalRecord
  extends ApprovalBase
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export class RegistrationTypes {
  email: string;
  institutionName: string;
  status: ApprovalStatus;
  verified: boolean;
  nodeName: string;
  nodeAddress: string;
  nodePublicKey: string;
}

export class RegistrationRecord
  extends RegistrationTypes
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
