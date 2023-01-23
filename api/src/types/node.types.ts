import { ApiProperty } from '@nestjs/swagger';

export class Node {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;
}

export class NodeDto extends Node {
  @ApiProperty()
  isLocal: boolean;
}

