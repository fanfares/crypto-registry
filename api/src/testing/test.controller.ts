import { Post, Controller, Body, BadRequestException, Get } from '@nestjs/common';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer';
import { createTestData } from './create-test-data';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config/api-config.service';
import { SubmissionDbService } from '../exchange/submission-db.service';
import { MockAddressDbService } from '../crypto/mock-address-db.service';
import { ExchangeService } from '../exchange/exchange.service';

@Controller('test')
@ApiTags('test')
export class TestController {
  constructor(
    private exchangeDbService: ExchangeDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private submissionDbService: SubmissionDbService,
    private mockAddressDbService: MockAddressDbService,
    private exchangeService: ExchangeService
  ) {}

  @Get('reset')
  async resetDb() {
    await createTestData(
      this.exchangeDbService,
      this.customerHoldingsDbService,
      this.submissionDbService,
      this.apiConfigService,
      this.mockAddressDbService,
      this.exchangeService
    );
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
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

  @Post('send-test-verification-email')
  @ApiBody({ type: SendTestEmailDto })
  async sendTestVerificationEmail(@Body() body: SendTestEmailDto) {
    try {
      await this.mailService.sendVerificationEmail(body.email, [{
        customerHoldingAmount: 100,
        exchangeName: 'Exchange Name'
      }]);
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }
}
