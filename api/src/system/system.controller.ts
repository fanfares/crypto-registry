import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemConfig, SystemStatus } from '@bcr/types';
import { ApiConfigService } from '../api-config';

@ApiTags('system')
@Controller('system')
export class SystemController {

  constructor(private apiConfigService: ApiConfigService) {
  }

  @Get('config')
  @ApiResponse({ type: SystemConfig })
  getSystemConfig(): SystemConfig {
    return {
      docsUrl: `${this.apiConfigService.docsUrl}`
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
