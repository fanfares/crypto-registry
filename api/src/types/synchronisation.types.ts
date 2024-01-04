import { VerificationRecord } from './verification.types';
import { SubmissionRecord } from './submission-db.types';
import { SubmissionConfirmationRecord } from './submission-confirmation.types';
import { HoldingRecord } from './customer-holding.db.types';
import { ApiProperty } from '@nestjs/swagger';

export class SyncRequestMessage {
  @ApiProperty()
  address: string;

  @ApiProperty()
  latestVerificationId: string | null;

  @ApiProperty()
  latestSubmissionId: string | null;

  @ApiProperty()
  leaderVote: string;
}

export class SyncDataMessage {
  verifications: VerificationRecord[];
  submissions: SubmissionRecord[];
  customerHoldings: HoldingRecord[];
  submissionConfirmations: SubmissionConfirmationRecord[];
}
