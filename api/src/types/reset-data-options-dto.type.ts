import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ResetDataOptions {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  retainUsers?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  createDefaultUsers?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  createFunding?: boolean;

  @ApiPropertyOptional()
  numberOfFundingSubmissions?: number;

  @ApiPropertyOptional()
  numberOfFundingAddresses?: number;

  @ApiPropertyOptional()
  numberOfExchanges?: number;

  @ApiPropertyOptional()
  numberOfFundedAddresses?: number;
}
