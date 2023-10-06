import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Network } from './network.type';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExtendedKeyValidationResult {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional({enum: Network, enumName: 'Network'})
  network?: Network;
}

export class ZpubDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  zpub: string;
}
