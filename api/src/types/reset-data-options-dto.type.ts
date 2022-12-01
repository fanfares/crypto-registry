import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ResetDataOptions {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  createHoldings: boolean;
}
