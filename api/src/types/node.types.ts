import { ApiProperty } from '@nestjs/swagger';

export class Node {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  isLocal: boolean;
}

export class NodeDto extends Node {
  @ApiProperty()
  isLocal: boolean;
}

