import { Controller, Get, Res, Logger, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemConfig, SystemStatus } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { Response } from 'express';
import { migrateDb } from '../db/migrate-db';
import { DbService } from '../db/db.service';

@ApiTags('system')
@Controller('system')
export class SystemController {
  private logger= new Logger(SystemController.name);

  constructor(
    private apiConfigService: ApiConfigService,
    private db: DbService
  ) {
  }

  @Post()
  @ApiResponse({ type: String, isArray: true})
  async migrateDb() {
    return await migrateDb(this.db)
  }

  @Get('config')
  @ApiResponse({type: SystemConfig})
  getSystemConfig(): SystemConfig {
    return {
      docsUrl: this.apiConfigService.docsUrl,
      nodeName: this.apiConfigService.nodeName,
      nodeAddress: this.apiConfigService.nodeAddress,
      institutionName: this.apiConfigService.institutionName
    };
  }

  @Get('test-logger')
  testLogging(): void {
    this.logger.log('test-log', {
      someData: 'hello',
      someValue: Math.random()
    })
  }

  @Get()
  @ApiResponse({type: SystemStatus, status: 200})
  systemTest(
    @Res() res: Response
  ): void {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    res.json({
      status: 'ok'
    });
  }
}
