import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Network } from './network.type';

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

export class AddressDto {
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

  @ApiProperty({ enumName: 'Network', enum: Network })
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  exchangeName;

  @ApiProperty({
    type: CustomerHoldingDto,
    isArray: true
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CustomerHoldingDto)
  customerHoldings: CustomerHoldingDto[];
}

export enum SubmissionStatus {
  WAITING_FOR_PAYMENT = 'waiting-for-payment',
  CANCELLED = 'cancelled',
  INSUFFICIENT_FUNDS = 'insufficient-funds',
  SENDER_MISMATCH = 'sender-mismatch',
  VERIFIED = 'verified',
}

export class SubmissionStatusDto {
  @ApiProperty({ type: String })
  paymentAddress: string;

  @ApiPropertyOptional()
  totalCustomerFunds?: number;

  @ApiPropertyOptional()
  totalExchangeFunds?: number;

  @ApiProperty({ type: Number })
  paymentAmount: number;

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

  @ApiProperty({ enumName: 'Network', enum: Network })
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;
}
