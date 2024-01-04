import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Network } from './network.type';
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
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeId: string;

  @ApiProperty({enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;

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

export class CreateFundingSubmissionCsvDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeId: string;

  @ApiProperty({enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signingMessage: string;
}

