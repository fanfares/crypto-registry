import { ApiProperty } from '@nestjs/swagger';
import { DatabaseRecord } from './db.types';

export class VerificationBase {
  @ApiProperty()
  hashedEmail: string;

  @ApiProperty()
  initialNodeAddress: string;

  @ApiProperty()
  selectedNodeAddress: string;

  @ApiProperty()
  blockHash: string;

  @ApiProperty()
  sentEmail: boolean;
}

export class VerificationRecord
  extends VerificationBase
  implements DatabaseRecord {

  @ApiProperty()
  _id: string;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;
}
