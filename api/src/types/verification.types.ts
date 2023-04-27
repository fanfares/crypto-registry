import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { DatabaseRecord } from './db.types';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { plainToInstance, Transform } from "class-transformer";

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

  @ApiPropertyOptional()
  index?: number;

  @ApiPropertyOptional()
  precedingHash?: string;

  @ApiPropertyOptional()
  confirmedBySender?: boolean;
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

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  index?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  confirmedBySender?: boolean;

  public static parse(jsonString: string): VerificationMessageDto {
    return plainToInstance(VerificationMessageDto, JSON.parse(jsonString));
  }
}

export class VerificationConfirmationDto
  extends OmitType(VerificationBase, ['confirmedBySender']) {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  _id: string;
}

export class ChainStatus {
  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  brokenLinkVerificationId: string
}
