import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { HoldingsSubmissionsRecord } from './customer-holding.db.types';

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

export class CreateHoldingsSubmissionDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @Type(() => CustomerHoldingDto)
  holdings: CustomerHoldingDto[];
}

export class HoldingsSubmissionDto extends HoldingsSubmissionsRecord {
  @ApiProperty()
  holdings: CustomerHoldingDto[];
}

