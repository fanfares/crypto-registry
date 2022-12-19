import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

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

  @ApiProperty({type: String})
  exchangeName: string;

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

}
