import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { FundingSubmissionRecord } from './funding-submission.db.types';

import { FundingAddressBase } from './funding-address.type';

export class CreateRegisteredAddressDto extends OmitType(FundingAddressBase, [
  'balance', 'validFromDate', 'fundingSubmissionId']) {
}

export class SubmissionId {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class CreateFundingSubmissionDto {
  @ApiProperty({
    type: CreateRegisteredAddressDto,
    isArray: true
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateRegisteredAddressDto)
  addresses: CreateRegisteredAddressDto[];
}

export class FundingSubmissionDto extends FundingSubmissionRecord {
  @ApiProperty({
    type: FundingAddressBase,
    isArray: true
  })
  addresses: FundingAddressBase[];
}

export class FundingDto {
  @ApiProperty({ type: FundingSubmissionDto})
  current: FundingSubmissionDto;

  @ApiPropertyOptional({ type: FundingSubmissionDto})
  pending?: FundingSubmissionDto
}

export class CreateFundingSubmissionCsvDto {
}

