import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SystemStatus, SendTestEmailDto, SystemConfig } from '@bcr/types';
import { MailService } from '../mail/mail.service';
import { Request } from 'express';
import { ApiConfigService } from '../api-config/api-config.service';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
  ) {}

  @Get('test')
  @ApiResponse({ type: SystemStatus })
  systemTest(): SystemStatus {
    return {
      status: 'ok',
    };
  }

  @Post('send-test-email')
  @ApiBody({ type: SendTestEmailDto })
  async sendTestEmail(@Body() body: SendTestEmailDto) {
    try {
      await this.mailService.sendTestEmail(body.email, 'Rob');
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Get('config')
  @ApiResponse({ type: SystemConfig })
  getSystemConfig(@Req() req: Request): SystemConfig {
    const hostUrl = `${req.get('protocol') || 'http'}://${req.get('host')}`;
    return {
      docsUrl: `${hostUrl}/docs`,
      publicKey: this.apiConfigService.registryKey,
      apiUrl: `${hostUrl}/api`,
    };
  }
}
