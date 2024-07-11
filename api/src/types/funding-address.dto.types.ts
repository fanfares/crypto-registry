import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FundingAddressRecord, FundingAddressStatus } from './funding-address.type';

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

  @ApiPropertyOptional()
  @IsEnum(FundingAddressStatus)
  @IsOptional()
  status?: FundingAddressStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;
}

export class FundingAddressDto extends FundingAddressRecord {
}

export class FundingAddressQueryResultDto {
  @ApiProperty({ isArray: true, type: FundingAddressDto})
  addresses: FundingAddressDto[]

  @ApiProperty()
  total: number;
}

export class FundingAddressRefreshRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
}
