import { DatabaseRecord } from './db.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Network } from './network.type';

export enum FundingAddressStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export class FundingAddressBase {
  @ApiPropertyOptional()
  balance?: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  failureMessage?: string;

  @ApiPropertyOptional()
  signatureDate?: Date;

  @ApiPropertyOptional()
  balanceDate?: Date;

  @ApiProperty()
  exchangeId: string;

  @ApiProperty({ enum: Network, enumName: 'Network' })
  network: Network;

  @ApiProperty({
    enum: FundingAddressStatus,
    enumName: 'FundingAddressStatus'
  })
  status: FundingAddressStatus;

  @ApiProperty()
  retryCount: number
}

export class FundingAddressRecord extends FundingAddressBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
