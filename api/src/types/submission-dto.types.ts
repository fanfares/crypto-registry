import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
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

export class CreateSubmissionDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  exchangeZpub;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  exchangeName;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  initialNodeAddress;

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
}

export enum SubmissionStatus {
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

  @ApiProperty({ type: String })
  paymentAddress: string;

  @ApiProperty()
  initialNodeAddress: string;

  @ApiProperty()
  hash: string;

  @ApiPropertyOptional()
  totalCustomerFunds: number;

  @ApiPropertyOptional()
  totalExchangeFunds: number;

  @ApiProperty({ type: Number })
  paymentAmount: number;

  @ApiProperty({ type: String })
  exchangeZpub: string;

  @ApiProperty({ type: String })
  exchangeName: string;

  @ApiProperty({ enum: Network, enumName: 'Network'})
  network: Network

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
}

export class CreateSubmissionCsvDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  exchangeZpub;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  exchangeName;
}
