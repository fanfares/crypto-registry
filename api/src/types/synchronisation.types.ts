import { VerificationRecord } from './verification.types';
import { SubmissionConfirmationRecord } from './submission-confirmation.types';
import { HoldingRecord } from './customer-holding.db.types';
import { ApiProperty } from '@nestjs/swagger';
import { FundingAddressBase } from './funding-address.type';

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
  addresses: FundingAddressBase[];
  customerHoldings: HoldingRecord[];
  submissionConfirmations: SubmissionConfirmationRecord[];
}
