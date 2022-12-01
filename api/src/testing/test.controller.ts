import { Post, Controller, Body, BadRequestException } from '@nestjs/common';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer';
import { createTestData } from './create-test-data';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail/mail.service';
import { ApiConfigService } from '../api-config/api-config.service';

@Controller('test')
@ApiTags('test')
export class TestController {
  constructor(
    private exchangeDbService: ExchangeDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Post('reset')
  async resetDb() {
    await createTestData(
      this.exchangeDbService,
      this.customerHoldingsDbService,
      this.apiConfigService
    );
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
