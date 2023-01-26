import { ApiProperty } from '@nestjs/swagger';
import { DatabaseRecord } from './db.types';

export class Node {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  unresponsive: boolean;
}

export class NodeRecord extends Node implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export class NodeDto extends NodeRecord {
  @ApiProperty()
  isLocal: boolean;
}

