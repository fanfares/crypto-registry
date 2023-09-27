import { DatabaseRecord } from './db.types';
import { Network } from '@bcr/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum SubmissionWalletStatus {
  WAITING_FOR_PAYMENT_ADDRESS = 'waiting-for-payment-address',
  WAITING_FOR_PAYMENT = 'waiting-for-payment',
  PAID = 'paid',
  SENDER_MISMATCH = 'sender-mismatch',
}

export class SubmissionWallet {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  paymentAddressIndex?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  paymentAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeZpub: string;

  @ApiProperty({ enum: SubmissionWalletStatus, enumName: 'SubmissionWalletStatus'})
  @IsNotEmpty()
  @IsEnum(SubmissionWalletStatus)
  status: SubmissionWalletStatus;
}


export enum SubmissionStatus {
  NEW = 'new',
  RETRIEVING_WALLET_BALANCE = 'retrieving-wallet-balance',
  INSUFFICIENT_FUNDS = 'insufficient-funds',
  WAITING_FOR_PAYMENT = 'waiting-for-payment',
  WAITING_FOR_PAYMENT_ADDRESS = 'waiting-for-payment-address',
  CANCELLED = 'cancelled',
  SENDER_MISMATCH = 'sender-mismatch',
  WAITING_FOR_CONFIRMATION = 'waiting-for-confirmation',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}


export class SubmissionBase {
  @ApiProperty()
  receiverAddress: string;

  @ApiProperty()
  leaderAddress: string;

  @ApiProperty({ enum: Network, enumName: 'Network'})
  network: Network;

  @ApiProperty({ enum: SubmissionStatus, enumName: 'SubmissionStatus'})
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
  isCurrent: boolean;

  @ApiProperty()
  confirmationsRequired: number | null;

  @ApiProperty()
  confirmationDate: Date | null
}

export class SubmissionRecord extends SubmissionBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
