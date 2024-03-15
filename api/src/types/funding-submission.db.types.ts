import { DatabaseRecord } from './db.types';
import { FundingAddressBase, Network } from '@bcr/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FundingSubmissionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  COMPLETE = 'complete',
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

  @ApiPropertyOptional()
  submissionFunds?: number;
}

export class FundingSubmissionRecord extends FundingSubmissionBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
