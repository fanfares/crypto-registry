import { DatabaseRecord } from './db.types';
import { Network } from '@bcr/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum SubmissionWalletStatus {
  NEW = 'new',
  VERIFIED = 'verified',
  INVALID_SIGNATURE = 'invalid-signature',
}

export class SubmissionWallet {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsOptional()
  signature?: string;
}


export enum SubmissionStatus {
  NEW = 'new',
  RETRIEVING_WALLET_BALANCE = 'retrieving-wallet-balance',
  INSUFFICIENT_FUNDS = 'insufficient-funds',
  CANCELLED = 'cancelled',
  WAITING_FOR_CONFIRMATION = 'waiting-for-confirmation',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  PROCESSING_FAILED = 'processing-failed',
  INVALID_SIGNATURE = 'invalid-signature'
}

export class SubmissionBase {
  @ApiProperty()
  receiverAddress: string;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiProperty({enum: Network, enumName: 'Network'})
  network: Network;

  @ApiProperty({enum: SubmissionStatus, enumName: 'SubmissionStatus'})
  status: SubmissionStatus;

  @ApiProperty()
  totalCustomerFunds: number;

  @ApiProperty()
  totalExchangeFunds: number | null;

  @ApiProperty()
  exchangeName: string;

  @ApiProperty({
    type: SubmissionWallet,
    isArray: true
  })
  wallets: SubmissionWallet[];

  @ApiProperty()
  signingMessage: string;

  @ApiProperty()
  isCurrent: boolean;

  @ApiProperty()
  confirmationsRequired: number | null;

  @ApiProperty()
  confirmationDate: Date | null;
}

export class SubmissionRecord extends SubmissionBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
