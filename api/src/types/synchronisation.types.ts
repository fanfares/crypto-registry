import { VerificationRecord } from './verification.types';
import { SubmissionRecord } from './submission-db.types';
import { SubmissionConfirmationRecord } from './submission-confirmation.types';
import { CustomerHoldingRecord } from './customer-holding-db.types';

export class SyncRequestMessage {
  latestVerificationHash: string;
  latestVerificationIndex: number;
  latestSubmissionHash: string;
  latestSubmissionIndex: number;
}

export class SyncDataMessage {
  verifications: VerificationRecord[];
  submissions: SubmissionRecord[];
  customerHoldings: CustomerHoldingRecord[];
  submissionConfirmations: SubmissionConfirmationRecord[];
}
