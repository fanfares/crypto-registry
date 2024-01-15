import { DatabaseRecord } from './db.types';
import { Network } from '@bcr/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegisteredAddress {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  balance: number | null;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  signature: string;
}

export enum FundingSubmissionStatus {
  RETRIEVING_BALANCES = 'retrieving-balances',
  RETRIEVING_BALANCES_FAILED = 'failed',
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

  @ApiProperty({
    type: RegisteredAddress,
    isArray: true
  })
  addresses: RegisteredAddress[]; // todo - convert to collection?

  @ApiProperty()
  totalFunds: number | null;

  @ApiProperty()
  signingMessage: string;

  @ApiProperty()
  isCurrent: boolean;
}

export class FundingSubmissionRecord extends FundingSubmissionBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
