import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { DatabaseRecord } from './db.types';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';

export class VerificationBase {
  @ApiProperty()
  hashedEmail: string;

  @ApiProperty()
  receivingAddress: string;

  @ApiProperty()
  leaderAddress: string;

  @ApiProperty()
  sentEmail: boolean;

  @ApiProperty()
  requestDate: Date;

  @ApiProperty()
  hash: string;

  @ApiProperty()
  index: number;

  @ApiProperty()
  precedingHash: string;

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
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  leaderNodeAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  receivingNodeAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  requestDate: Date;
}

export class VerificationConfirmationDto
  extends OmitType(VerificationBase, ['confirmedBySender']) {
}

export class ChainStatus {
  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  brokenLinkVerificationId: string
}
