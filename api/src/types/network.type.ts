import { ApiProperty } from '@nestjs/swagger';
import { NodeDto } from './node.types';
import { MessageDto } from './message.types';

export class NetworkStatusDto {
  @ApiProperty()
  nodeName: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ type: NodeDto, isArray: true })
  nodes: NodeDto[];

  @ApiProperty({ type: MessageDto, isArray: true })
  messages: MessageDto[];
}

export enum Network {
  testnet = 'testnet',
  mainnet = 'mainnet'
}
