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
  @IsNotEmpty()
  @IsNumber()
  index: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  change: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  derivationPath: string;

  @ApiProperty({ enumName: 'Network', enum: Network})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  balance: number
}
