import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerHolding {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hashedEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class CustomerHoldingsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  custodianName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @ApiProperty({type: CustomerHolding, isArray: true})
  @IsNotEmpty()
  @IsArray()
  @Type(() => CustomerHolding)
  customerHoldings: CustomerHolding[];
}
