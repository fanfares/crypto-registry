import { ApiProperty } from '@nestjs/swagger';
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

export class SubmissionDto {
  @ApiProperty({
    type: String
  })
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
  UNUSED = 'unused',
  WAITING_FOR_PAYMENT = 'waiting-for-payment',
  COMPLETE = 'complete',
}

export class SubmissionStatusDto {
  @ApiProperty({ type: String })
  paymentAddress: string;

  @ApiProperty({ type: Number })
  paymentAmount: number;

  @ApiProperty({
    enum: SubmissionStatus,
    enumName: 'SubmissionStatus'
  })
  submissionStatus: SubmissionStatus;
}
