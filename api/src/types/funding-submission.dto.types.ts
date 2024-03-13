import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { FundingSubmissionRecord } from './funding-submission.db.types';

import { FundingAddressBase } from './funding-address.type';

export class CreateRegisteredAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}

export class CreateFundingSubmissionDto {
  @ApiProperty({
    type: CreateRegisteredAddressDto,
    isArray: true
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateRegisteredAddressDto)
  @ValidateNested({ each: true })
  addresses: CreateRegisteredAddressDto[];

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  resetFunding: boolean
}

export class SubmissionId {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class FundingSubmissionDto extends FundingSubmissionRecord {
  @ApiProperty({
    type: FundingAddressBase,
    isArray: true
  })
  addresses: FundingAddressBase[];
}

export class FundingDto {
  @ApiProperty({type: FundingSubmissionDto})
  current: FundingSubmissionDto;

  @ApiPropertyOptional({type: FundingSubmissionDto})
  pending?: FundingSubmissionDto;
}

export class CreateFundingSubmissionCsvDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  resetFunding: boolean
}

