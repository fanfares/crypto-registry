import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Network } from './network.type';

export class BalanceCheckerRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;
}

export class BalanceCheckerResponseDto {
  @ApiProperty({ enumName: 'Network', enum: Network})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  electrumBalance: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  blockStreamBalance: number;
}
