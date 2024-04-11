import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { HoldingsSubmissionsRecord } from './customer-holding.db.types';

export class CustomerHoldingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hashedEmail?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  exchangeUid?: string;
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

