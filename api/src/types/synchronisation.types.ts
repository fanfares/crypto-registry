import { VerificationRecord } from './verification.types';
import { SubmissionRecord } from './submission-db.types';
import { SubmissionConfirmationRecord } from './submission-confirmation.types';
import { CustomerHoldingRecord } from './customer-holding-db.types';
import { ApiProperty } from '@nestjs/swagger';

export class SyncRequestMessage {
  @ApiProperty()
  latestVerificationHash: string;

  @ApiProperty()
  latestVerificationIndex: number;

  @ApiProperty()
  latestSubmissionHash: string;

  @ApiProperty()
  latestSubmissionIndex: number;

  @ApiProperty()
  leaderAddress: string;
}

export class SyncDataMessage {
  verifications: VerificationRecord[];
  submissions: SubmissionRecord[];
  customerHoldings: CustomerHoldingRecord[];
  submissionConfirmations: SubmissionConfirmationRecord[];
}
