import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { DatabaseRecord } from './db.types';

export class Exchange {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeName: string;
}

export class ExchangeRecord extends Exchange implements DatabaseRecord {
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

export class ExchangeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exchangeName: string;
}
