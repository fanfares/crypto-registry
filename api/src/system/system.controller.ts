import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { SystemStatus, SystemConfig } from '@bcr/types';
import { MailService } from '../mail/mail.service';
import { Request } from 'express';
import { ApiConfigService } from '../api-config/api-config.service';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(
    private mailService: MailService,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Get('config')
  @ApiResponse({ type: SystemConfig })
  getSystemConfig(@Req() req: Request): SystemConfig {
    const hostUrl = `${req.get('protocol') || 'http'}://${req.get('host')}`;
    return {
      docsUrl: `${hostUrl}/docs`,
      registryKey: this.apiConfigService.registryKey,
      apiUrl: `${hostUrl}/api`
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
