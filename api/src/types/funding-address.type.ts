import { DatabaseRecord } from './db.types';
import { ApiProperty } from '@nestjs/swagger';
import { Network } from './network.type';

export enum FundingAddressStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELLED = 'cancelled'
}

export class FundingAddressBase {
  @ApiProperty()
  balance: number | null;

  @ApiProperty()
  address: string;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  fundingSubmissionId: string;

  @ApiProperty()
  validFromDate: Date | null;

  @ApiProperty()
  exchangeId: string;

  @ApiProperty()
  network: Network;

  @ApiProperty({
    enum: FundingAddressStatus,
    enumName: 'FundingAddressStatus'
  })
  status: FundingAddressStatus;
}

export class FundingAddressRecord extends FundingAddressBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
