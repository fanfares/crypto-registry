import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FundingAddressRecord } from './funding-address.type';

export class FundingAddressQueryDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  pageSize: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  exchangeId?: string;
}

export class FundingAddressDto extends FundingAddressRecord {
}
