import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SystemStatus, SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail/mail.service';

@ApiTags('system')
@Controller('system')
export class SystemController {

  constructor(
    private mailService: MailService) {
  }

  @Get('test')
  @ApiResponse({type: SystemStatus})
  systemTest(): SystemStatus {
    return {
      status: 'ok'
    };
  }

  @Post('send-test-email')
  @ApiBody({type: SendTestEmailDto})
  async sendTestEmail(
    @Body() body: SendTestEmailDto
  ) {
    try {
      await this.mailService.sendTestEmail(body.email, 'Rob');
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

}
