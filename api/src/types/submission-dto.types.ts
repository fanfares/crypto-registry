import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SubmissionRecord, SubmissionStatus, SubmissionWallet } from './submission-db.types';
import { Network } from './network.type';
import { SubmissionConfirmationBase } from './submission-confirmation.types';

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

export class SubmissionId {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class CreateSubmissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  _id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeName: string;

  @ApiProperty({ enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  receiverAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leaderAddress?: string;

  @ApiProperty({
    type: CustomerHoldingDto,
    isArray: true
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CustomerHoldingDto)
  customerHoldings: CustomerHoldingDto[];

  @ApiProperty({
    type: SubmissionWallet,
    isArray: true
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => SubmissionWallet)
  wallets: SubmissionWallet[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  confirmationsRequired?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signingMessage: string;
}

export class SubmissionDto extends OmitType(SubmissionRecord,
  ['createdDate', 'updatedDate']) {

  @ApiProperty({
    isArray: true,
    type: SubmissionConfirmationBase
  })
  confirmations: SubmissionConfirmationBase[];
}

export class CreateSubmissionCsvDto {
  // nb - address loaded as file.
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeName: string;

  @ApiProperty({ enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;
}

