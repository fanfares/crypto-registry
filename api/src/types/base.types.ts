import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Network } from './network.type';

export class ZpubValidationResult {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional({enum: Network, enumName: 'Network'})
  network?: Network;
}
