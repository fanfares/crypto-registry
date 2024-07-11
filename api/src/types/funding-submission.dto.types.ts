import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateFundingAddressDto {
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
    type: CreateFundingAddressDto,
    isArray: true
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateFundingAddressDto)
  @ValidateNested({each: true})
  addresses: CreateFundingAddressDto[];

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  resetFunding: boolean;
}

export class SubmissionId {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class FundingStatusDto {
  @ApiProperty()
  numberOfPendingAddresses: number;

  @ApiProperty()
  numberOfActiveAddresses: number;

  @ApiProperty()
  numberOfFailedAddresses: number;
}

export class CreateFundingSubmissionCsvDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({value}) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  resetFunding: boolean;
}

