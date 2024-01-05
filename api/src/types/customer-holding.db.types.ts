import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
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
  @IsNotEmpty()
  @IsString()
  hashedEmail: string;

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
