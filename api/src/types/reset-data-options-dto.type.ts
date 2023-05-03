import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ResetNodeOptions {
  @IsBoolean()
  @IsOptional()
  resetChains?: boolean;

  @IsBoolean()
  @IsOptional()
  resetAll?: boolean;

  @IsBoolean()
  @IsOptional()
  resetNetwork?: boolean;

  @IsBoolean()
  @IsOptional()
  resetWallet?: boolean;

  @IsBoolean()
  @IsOptional()
  resetMockWallet?: boolean;

  @IsBoolean()
  @IsOptional()
  emitResetNetwork?: boolean;

  @IsBoolean()
  @IsOptional()
  autoStart?: boolean;

  @IsArray()
  @Type(() => String)
  @IsOptional()
  nodes?: string[];


}
