import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ResetNodeOptions {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resetChains?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resetAll?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resetNetwork?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resetWallet?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resetMockWallet?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emitResetNetwork?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @Type(() => String)
  @IsOptional()
  nodes?: string[];


}
