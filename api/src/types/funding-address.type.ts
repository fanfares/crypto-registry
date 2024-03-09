import { DatabaseRecord } from './db.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FundingAddressBase {
  @ApiProperty()
  balance: number | null;

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
  @IsOptional()
  message: string;

  @ApiProperty()
  fundingSubmissionId: string;

  @ApiProperty()
  validFromDate: Date | null;
}

export class FundingAddressRecord extends FundingAddressBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
