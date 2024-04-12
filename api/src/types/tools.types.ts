import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Network } from './network.type';

export class NetworkDto {
  @ApiProperty()
  @IsEnum(Network)
  @IsNotEmpty()
  network: Network;
}
