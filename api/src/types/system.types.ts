import { ApiProperty } from '@nestjs/swagger';

export class SystemStatus {
  @ApiProperty()
  status: string;
}

export class SystemConfig {
  @ApiProperty()
  registryKey: string;

  @ApiProperty()
  docsUrl: string;

  @ApiProperty()
  apiUrl: string;
}
