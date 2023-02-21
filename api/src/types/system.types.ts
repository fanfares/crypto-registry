import { ApiProperty } from '@nestjs/swagger';

export class SystemStatus {
  @ApiProperty()
  status: string;
}

export class SystemConfig {
  @ApiProperty()
  docsUrl: string;

  @ApiProperty()
  nodeName: string;

  @ApiProperty()
  institutionName: string;
}
