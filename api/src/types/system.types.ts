import { ApiProperty } from '@nestjs/swagger';

export class SystemStatus {
  @ApiProperty()
  status: string;
}

export class SystemConfig {
  @ApiProperty()
  publicKey: string;

  @ApiProperty()
  docsUrl: string;

  @ApiProperty()
  apiUrl: string;
}
