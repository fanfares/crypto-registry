import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Network } from './network.type';
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

export class CreateHoldingSubmissionCsvDto {
  @ApiProperty({enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // exchangeId: string;
}

export class CreateHoldingsSubmissionDto {
  @ApiProperty({enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // exchangeId: string;

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

