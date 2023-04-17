import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ResetDataOptions {
  @IsBoolean()
  @IsOptional()
  createSubmission?: boolean;

  @IsBoolean()
  @IsOptional()
  completeSubmission?: boolean;

  @IsBoolean()
  @IsOptional()
  dontResetWalletHistory?: boolean;

  @IsBoolean()
  @IsOptional()
  resetVerificationsAndSubmissionsOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  resetNetwork?: boolean;

  @IsBoolean()
  @IsOptional()
  emitResetNetwork?: boolean;

  @IsArray()
  @Type(() => String)
  @IsOptional()
  nodes?: string[];
}
