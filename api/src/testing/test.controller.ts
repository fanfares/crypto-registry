import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { createTestData } from './create-test-data';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SendFundsDto, SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { SubmissionDbService, SubmissionService } from '../submission';
import { MockAddressDbService, MockBitcoinService } from '../crypto';

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
    private exchangeService: SubmissionService
  ) {
  }

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

  @Post('send-test-verification-email')
  @ApiBody({ type: SendTestEmailDto })
  async sendTestVerificationEmail(@Body() body: SendTestEmailDto) {
    try {
      await this.mailService.sendVerificationEmail(body.email, [{
        customerHoldingAmount: 22276400,
        exchangeName: 'Binance'
      }]);
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

  @Post('send-funds')
  @ApiBody({ type: SendFundsDto })
  async sendFunds(
    @Body() body: SendFundsDto
  ) {
    const bitcoinService = new MockBitcoinService(this.mockAddressDbService);
    await bitcoinService.sendFunds(body.fromAddress, body.toAddress, body.amount);
    return {
      status: 'success'
    };
  }
}
