import { VerificationRecord } from './verification.types';
import { SubmissionRecord } from './submission-db.types';
import { SubmissionConfirmationRecord } from './submission-confirmation.types';
import { CustomerHoldingRecord } from './customer-holding-db.types';
import { ApiProperty } from '@nestjs/swagger';
import { WalletAddressRecord } from './wallet-address-db.types';

export class SyncRequestMessage {
  @ApiProperty()
  address: string;

  @ApiProperty()
  latestVerificationId: string | null;

  @ApiProperty()
  latestSubmissionId: string | null;

  @ApiProperty()
  mainnetRegistryWalletAddressCount: number;

  @ApiProperty()
  testnetRegistryWalletAddressCount: number;

  @ApiProperty()
  leaderVote: string;

  @ApiProperty()
  isStarting: boolean;
}

export class SyncDataMessage {
  verifications: VerificationRecord[];
  submissions: SubmissionRecord[];
  customerHoldings: CustomerHoldingRecord[];
  submissionConfirmations: SubmissionConfirmationRecord[];
  resetWalletHistory: boolean;
}
