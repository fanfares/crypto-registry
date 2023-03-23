import { IsBoolean, IsOptional } from 'class-validator';

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
}
