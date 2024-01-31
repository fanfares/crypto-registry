import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { FundingSubmissionRecord, RegisteredAddress } from './funding-submission.db.types';

export class CreateRegisteredAddressDto extends OmitType(RegisteredAddress, [
  'balance']) {
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

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signingMessage: string;
}

export class FundingSubmissionDto extends FundingSubmissionRecord {
}

export class FundingDto {
  @ApiProperty({ type: FundingSubmissionDto})
  current: FundingSubmissionDto;

  @ApiPropertyOptional({ type: FundingSubmissionDto})
  pending?: FundingSubmissionDto
}

export class CreateFundingSubmissionCsvDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signingMessage: string;
}

