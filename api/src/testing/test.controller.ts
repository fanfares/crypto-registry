import { BadRequestException, Body, Controller, Logger, Post, Get, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ResetDataOptions, SendFundsDto, SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { TestUtilsService } from './test-utils.service';
import { IsAuthenticatedGuard } from '../user/is-authenticated.guard';
import { IsAdminGuard } from '../user/is-admin.guard';

@Controller('test')
@ApiTags('test')
@UseGuards(IsAdminGuard)
export class TestController {
  constructor(
    private testUtilsService: TestUtilsService,
    private db: DbService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private submissionService: SubmissionService,
    private walletService: WalletService,
    private loggerService: Logger
  ) {
  }

  @Post('reset')
  @ApiBody({ type: ResetDataOptions })
  async resetDb(
    @Body() options: ResetDataOptions
  ) {
    await this.testUtilsService.resetTestData(options);
    return {
      status: 'ok'
    };
  }

  @Post('reset-wallet-history')
  async resetWalletHistory() {
    await this.testUtilsService.resetWalletHistory();
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
      this.loggerService.error(err);
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
      }], this.apiConfigService.nodeName, this.apiConfigService.nodeAddress);
    } catch (err) {
      this.loggerService.error(err);
      throw new BadRequestException(err.message);
    }
  }

  @Post('send-funds')
  @ApiBody({ type: SendFundsDto })
  async sendFunds(
    @Body() body: SendFundsDto
  ) {
    await this.walletService.sendFunds(body.senderZpub, body.toAddress, body.amount);
    return {
      status: 'success'
    };
  }

  @Get('guarded-route')
  @UseGuards(IsAuthenticatedGuard)
  async getGuardedRoute() {
    return {
      status: 'ok'
    };
  }
}
