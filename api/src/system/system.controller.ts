import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { SystemStatus } from '@bcr/types';

@ApiTags('system')
@Controller('system')
export class SystemController {

  @Get('test')
  @ApiResponse({type: SystemStatus})
  systemTest(): SystemStatus {
    return {
      status: 'ok'
    };
  }
}
