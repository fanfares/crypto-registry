import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Network } from './network.type';

export class VerifyRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ enum: Network, enumName: 'Network'})
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network
}
