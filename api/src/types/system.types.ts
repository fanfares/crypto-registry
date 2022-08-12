import { ApiProperty } from '@nestjs/swagger';

export class SystemStatus {
  @ApiProperty()
  status: string;
}
