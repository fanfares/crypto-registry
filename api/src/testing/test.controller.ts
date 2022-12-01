import { Post, Controller, Body, BadRequestException } from '@nestjs/common';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer';
import { createTestData } from './create-test-data';
import { ApiBody } from '@nestjs/swagger';
import { SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail/mail.service';

@Controller('test')
export class TestController {
  constructor(
    private exchangeDbService: ExchangeDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService,
    private mailService: MailService
  ) {
  }

  @Post('reset')
  async resetDb() {
    await createTestData(this.exchangeDbService, this.customerHoldingsDbService);
    return {
      status: 'ok'
    };
  }

  @Post('send-test-email')
  @ApiBody({ type: SendTestEmailDto })
  async sendTestEmail(@Body() body: SendTestEmailDto) {
    try {
      await this.mailService.sendTestEmail(body.email, 'Rob');
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

}
