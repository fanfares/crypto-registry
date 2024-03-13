import { VerificationRecord } from './verification.types';
import { SubmissionConfirmationRecord } from './submission-confirmation.types';
import { HoldingRecord } from './customer-holding.db.types';
import { ApiProperty } from '@nestjs/swagger';
import { FundingSubmissionRecord } from './funding-submission.db.types';

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
  submissions: FundingSubmissionRecord[];
  customerHoldings: HoldingRecord[];
  submissionConfirmations: SubmissionConfirmationRecord[];
}
