import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Network } from '@bcr/types';

export class ResetDataOptions {
  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  createSubmission?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  completeSubmission?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  dontResetWalletHistory?: boolean;
}
