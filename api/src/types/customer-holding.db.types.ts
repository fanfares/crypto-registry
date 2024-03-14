import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { DatabaseRecord } from './db.types';

export class HoldingBase {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  holdingsSubmissionId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  hashedEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  exchangeUid?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isCurrent: boolean;
}

export class HoldingRecord
  extends HoldingBase
  implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}

export class HoldingsSubmissionBase {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  totalHoldings: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exchangeUid?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isCurrent: boolean;
}

export class HoldingsSubmissionsRecord
  extends HoldingsSubmissionBase
  implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
