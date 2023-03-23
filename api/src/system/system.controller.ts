import { Controller, Get, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemConfig, SystemStatus } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { Response } from 'express';

@ApiTags('system')
@Controller('system')
export class SystemController {

  constructor(private apiConfigService: ApiConfigService) {
  }

  @Get('config')
  @ApiResponse({ type: SystemConfig })
  getSystemConfig(): SystemConfig {
    return {
      docsUrl: this.apiConfigService.docsUrl,
      nodeName: this.apiConfigService.nodeName,
      nodeAddress: this.apiConfigService.nodeAddress,
      institutionName: this.apiConfigService.institutionName
    };
  }

  @Get()
  @ApiResponse({ type: SystemStatus, status: 200 })
  systemTest(
    @Res() res: Response
  ): void {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    res.json({
      status: 'ok'
    });
  }
}
