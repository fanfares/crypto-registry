import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { SystemStatus, SystemConfig } from '@bcr/types';
import { Request } from 'express';

@ApiTags('system')
@Controller('system')
export class SystemController {

  @Get('config')
  @ApiResponse({ type: SystemConfig })
  getSystemConfig(@Req() req: Request): SystemConfig {
    const hostUrl = `${req.get('protocol') || 'http'}://${req.get('host')}`;
    return {
      docsUrl: `${hostUrl}/docs`
    };
  }

  @Get()
  @ApiResponse({ type: SystemStatus })
  systemTest(): SystemStatus {
    return {
      status: 'ok'
    };
  }
}
