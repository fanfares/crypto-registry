import { DatabaseRecord } from './db.types';
import { Network } from '@bcr/types';
import { ApiProperty } from '@nestjs/swagger';

export class FundingSubmissionBase {
  @ApiProperty({enum: Network, enumName: 'Network'})
  network: Network;

  @ApiProperty()
  exchangeId: string;
}

export class FundingSubmissionRecord extends FundingSubmissionBase implements DatabaseRecord {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
