import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Network } from './network.type';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExtendedKeyValidationResult {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional({enum: Network, enumName: 'Network'})
  network?: Network;

  @ApiPropertyOptional()
  isPrivate?: boolean;
}

export class GenerateAddressFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  zprv: string;
}
