import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { DatabaseRecord } from './db.types';
import { Network } from './network.type';

export enum ExchangeStatus {
  AWAITING_DATA = 'awaiting-data',
  INSUFFICIENT_FUNDS = 'insufficient-funds',
  OK = 'ok',
}

export class ExchangeBase {
  @ApiProperty()
  name: string;

  @ApiProperty()
  currentFunds: number | null;

  @ApiProperty()
  fundingSource: Network | null;

  @ApiProperty()
  currentHoldings: number | null;

  @ApiProperty({enum: ExchangeStatus, enumName: 'ExchangeStatus'})
  status: ExchangeStatus;

  @ApiPropertyOptional()
  holdingsAsAt?: Date;

  @ApiPropertyOptional()
  fundingAsAt?: Date;
}


export class ExchangeRecord extends ExchangeBase implements DatabaseRecord {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  createdDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  updatedDate: Date;
}

export class ExchangeDto extends ExchangeRecord {
}
