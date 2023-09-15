import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Network } from './network.type';
import { SubmissionConfirmationBase } from './submission-confirmation.types';

export class CustomerHoldingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hashedEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class SubmissionId {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class CreateSubmissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  _id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeZpub: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  receiverAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leaderAddress?: string;

  @ApiProperty({
    type: CustomerHoldingDto,
    isArray: true
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CustomerHoldingDto)
  customerHoldings: CustomerHoldingDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentAddress?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  paymentAddressIndex?:number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  confirmationsRequired?: number;
}

export enum SubmissionStatus {
  NEW = 'new',
  RETRIEVING_WALLET_BALANCE = 'retrieving-wallet-balance',
  INSUFFICIENT_FUNDS = 'insufficient-funds',
  WAITING_FOR_PAYMENT = 'waiting-for-payment',
  CANCELLED = 'cancelled',
  SENDER_MISMATCH = 'sender-mismatch',
  WAITING_FOR_CONFIRMATION = 'waiting-for-confirmation',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export class SubmissionDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  paymentAddress: string;

  @ApiProperty()
  initialNodeAddress: string;

  @ApiPropertyOptional()
  hash?: string;

  @ApiPropertyOptional()
  totalCustomerFunds: number;

  @ApiPropertyOptional()
  totalExchangeFunds?: number;

  @ApiProperty()
  balanceRetrievalAttempts: number;

  @ApiProperty()
  paymentAmount: number;

  @ApiProperty()
  exchangeZpub: string;

  @ApiProperty()
  exchangeName: string;

  @ApiProperty({enum: Network, enumName: 'Network'})
  network: Network;

  @ApiProperty()
  isCurrent: boolean;

  @ApiProperty({
    enum: SubmissionStatus,
    enumName: 'SubmissionStatus'
  })
  status: SubmissionStatus;

  @ApiProperty({
    isArray: true,
    type: SubmissionConfirmationBase
  })
  confirmations: SubmissionConfirmationBase[];

  @ApiPropertyOptional()
  confirmationsRequired?: number;

  @ApiPropertyOptional()
  index?: number;
}

export class CreateSubmissionCsvDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeZpub: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeName: string;
}


