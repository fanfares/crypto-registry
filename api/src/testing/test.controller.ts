import { BadRequestException, Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ResetNodeOptions, SendFundsDto, SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { TestUtilsService } from './test-utils.service';
import { IsAuthenticatedGuard } from '../user/is-authenticated.guard';
import { IsAdminGuard } from '../user/is-admin.guard';

@Controller('test')
@ApiTags('test')
export class TestController {
  constructor(
    private testUtilsService: TestUtilsService,
    private db: DbService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private walletService: WalletService,
    private loggerService: Logger
  ) {
  }

  @Post('reset')
  @ApiBody({type: ResetNodeOptions})
  async resetDb(
    @Body() options: ResetNodeOptions
  ) {
    await this.testUtilsService.resetNode(options);
    return {
      status: 'ok'
    };
  }

  @Post('reset-wallet-history')
  @UseGuards(IsAdminGuard)
  async resetWalletHistory() {
    await this.testUtilsService.resetWalletHistory();
    return {
      status: 'ok'
    };
  }

  @Post('send-test-verification-email')
  @ApiBody({type: SendTestEmailDto})
  // @UseGuards(IsAdminGuard)
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
  @ApiBody({type: SendFundsDto})
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

  @Get('test-db')
  async testDb() {
    const count = await this.db.users.count({});
    return {
      count
    };
  }
}
