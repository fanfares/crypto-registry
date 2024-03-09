import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Network } from './network.type';

export class SignatureGeneratorRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  privateKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  maxIndex: number;
}

export class SignatureGeneratorResultDto {
  @ApiProperty()
  index: number;

  @ApiProperty()
  change: boolean;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  derivationPath: string;

  @ApiProperty({ enumName: 'Network', enum: Network})
  network: Network;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  validFromDate: Date
}
