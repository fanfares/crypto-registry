import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Network } from './network.type';
import { SubmissionConfirmation } from './submission-confirmation.types';

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

export class PaymentAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;
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
  initialNodeAddress: string;

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
  index?: number;
}

export enum SubmissionStatus {
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

  @ApiProperty({type: Number})
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
    type: SubmissionConfirmation
  })
  confirmations: SubmissionConfirmation[];

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


