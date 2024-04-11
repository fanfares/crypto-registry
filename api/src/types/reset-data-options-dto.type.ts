import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  numberOfHoldings?: number;

  @ApiPropertyOptional()
  numberOfFundingSubmissions?: number;

  @ApiPropertyOptional()
  numberOfFundingAddresses?: number;

  @ApiPropertyOptional()
  numberOfExchanges?: number;

  @ApiPropertyOptional()
  numberOfFundedAddresses?: number;
}
