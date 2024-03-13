import { DatabaseRecord } from './db.types';
import { FundingAddressBase, Network } from '@bcr/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FundingSubmissionStatus {
  WAITING_FOR_PROCESSING = 'waiting-for-processing',
  PROCESSING = 'processing',
  FAILED = 'failed',
  INVALID_SIGNATURES = 'invalid-signatures',
  CANCELLED = 'cancelled',
  ACCEPTED = 'accepted',
}

export class FundingSubmissionBase {
  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiProperty({enum: Network, enumName: 'Network'})
  network: Network;

  @ApiProperty({enum: FundingSubmissionStatus, enumName: 'FundingSubmissionStatus'})
  status: FundingSubmissionStatus;

  @ApiProperty()
  exchangeId: string;

  @ApiProperty()
  submissionFunds: number | null;
}

export class FundingSubmissionRecord extends FundingSubmissionBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
