import { ApiProperty } from '@nestjs/swagger';
import { NodeDto } from './node.types';

export class NetworkStatusDto {
  @ApiProperty()
  nodeName: string;

  @ApiProperty()
  address: string;

  @ApiProperty({type: NodeDto, isArray: true})
  nodes: NodeDto[];
}
