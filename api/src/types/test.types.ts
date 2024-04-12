import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Network } from './network.type';

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

export enum ServiceType {
  ELECTRUM_X = 'electrum-x',
  BITCOIN_CORE = 'bitcoin-core'
}

export class ServiceTestRequestDto {
  @ApiProperty({ enum: ServiceType, enumName: 'ServiceType'})
  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  @ApiProperty({ enum: Network, enumName: 'Network'})
  @IsEnum(Network)
  @IsNotEmpty()
  network: Network;
}
