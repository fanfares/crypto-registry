export enum ApprovalStatus {
  approved = 'approved',
  rejected = 'rejected',
  inProgress = 'in-progress'
}

export class ApprovalBase {
  status: ApprovalStatus;
  token: string;
  isTokenUsed: boolean;

}

export class RegistrationBase {
  email: string;
  exchangeName: string;
  status: ApprovalStatus;
}
