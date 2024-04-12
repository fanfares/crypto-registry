import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Network } from './network.type';

export class FundingFileRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  extendedKey: string;

  @ApiProperty({enum: Network, enumName: 'Network'})
  @IsEnum(Network)
  @IsNotEmpty()
  network: Network;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  lines: number;
}
