import { ApiProperty } from '@nestjs/swagger';

export class Peer {
  @ApiProperty()
  address: string

  @ApiProperty()
  isLocal: boolean
}
