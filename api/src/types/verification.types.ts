import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DatabaseRecord } from './db.types';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { plainToInstance, Transform } from "class-transformer";
import { Network } from './network.type';

export enum VerificationStatus {
  RECEIVED = 'received',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export class VerificationBase {
  @ApiPropertyOptional()
  hashedEmail?: string;

  @ApiPropertyOptional()
  exchangeUid?: string;

  @ApiPropertyOptional()
  receivingAddress?: string;

  @ApiPropertyOptional()
  leaderAddress?: string;

  @ApiProperty()
  requestDate: Date;

  @ApiProperty()
  status: VerificationStatus
}

export class VerificationRecord
  extends VerificationBase
  implements DatabaseRecord {

  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}

export class VerificationDto extends VerificationBase {
}

export class VerificationRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class VerifyByUidDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  uid: string;
}

export class VerificationMessageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  _id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leaderAddress?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  receivingAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Transform(({value}) => new Date(value), {toClassOnly: true})
  requestDate: Date;

  @ApiProperty({enum: VerificationStatus, enumName: 'VerificationStatus'})
  @IsNotEmpty()
  @IsEnum(VerificationStatus)
  status: VerificationStatus

  public static parse(jsonString: string): VerificationMessageDto {
    return plainToInstance(VerificationMessageDto, JSON.parse(jsonString));
  }
}

export class VerifiedHoldingsDto {
  @ApiProperty()
  holdingId: string;

  @ApiProperty()
  fundingAsAt: Date;

  @ApiProperty()
  customerHoldingAmount: number;

  @ApiProperty()
  exchangeName: string;

  @ApiProperty()
  fundingSource: Network;
}

export class VerificationResultDto {
  @ApiProperty()
  verificationId: string;

  @ApiProperty({ isArray: true, type: VerifiedHoldingsDto })
  verifiedHoldings: VerifiedHoldingsDto[]
}
