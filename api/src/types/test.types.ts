import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendFundsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  senderZpub: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  toAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class SendTestEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class ServiceTestResultDto {
  @ApiProperty()
  passed: boolean;

  @ApiPropertyOptional()
  errorMessage?: string;
}

export class ServiceTestResultsDto {
  @ApiProperty()
  bitcoinCoreMainnet: ServiceTestResultDto;

  @ApiProperty()
  bitcoinCoreTestnet: ServiceTestResultDto;

  @ApiProperty()
  electrumxMainnet: ServiceTestResultDto;

  @ApiProperty()
  electrumxTestnet: ServiceTestResultDto;
}
