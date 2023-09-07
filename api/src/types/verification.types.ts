import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DatabaseRecord } from './db.types';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { plainToInstance, Transform } from "class-transformer";

export enum VerificationStatus {
  RECEIVED = 'received',
  SENT = 'sent',
  FAILED = 'failed'
}

export class VerificationBase {
  @ApiProperty()
  hashedEmail: string;

  @ApiProperty()
  receivingAddress: string;

  @ApiPropertyOptional()
  leaderAddress?: string;

  @ApiProperty()
  requestDate: Date;

  @ApiPropertyOptional()
  hash?: string;

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

export class ChainStatus {
  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  brokenLinkVerificationId: string
}
