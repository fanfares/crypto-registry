import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DatabaseRecord } from './db.types';
import { Network } from './network.type';

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

  @ApiProperty({enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;
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

  @ApiProperty({enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;
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
