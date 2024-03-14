import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ResetNetworkOptionsDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resetNetwork?: boolean;

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
