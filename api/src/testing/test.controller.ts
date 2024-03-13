import { BadRequestException, Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Network, SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { IsAuthenticatedGuard, IsSystemAdminGuard } from '../auth';
import { subDays } from 'date-fns';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { ObjectId } from 'mongodb';
import { satoshiInBitcoin } from '../utils';
import { TestService } from './test.service';

@Controller('test')
@ApiTags('test')
export class TestController {
  constructor(
    private testService: TestService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private loggerService: Logger,
    private bitcoinServiceFactory: BitcoinServiceFactory
  ) {
  }

  @Get('test-electrum/:network')
  @UseGuards(IsSystemAdminGuard)
  async testBitcoinService(
    @Param('network') network: Network
  ) {
    // todo - need to add a timeout on this.
    return await this.bitcoinServiceFactory.getService(network).testService();
  }

  @Post('reset')
  @UseGuards(IsSystemAdminGuard)
  async resetDb() {
    await this.testService.resetDb();
    return {
      status: 'ok'
    };
  }

  @Post('send-test-verification-email')
  @ApiBody({type: SendTestEmailDto})
  @UseGuards(IsSystemAdminGuard)
  async sendTestVerificationEmail(@Body() body: SendTestEmailDto) {
    try {
      await this.mailService.sendVerificationEmail(body.email, [{
        holdingId: new ObjectId().toString(),
        customerHoldingAmount: 10.5667 * satoshiInBitcoin,
        exchangeName: 'Binance',
        fundingAsAt: subDays(new Date(), 4),
        fundingSource: Network.testnet
      }], this.apiConfigService.institutionName);
    } catch (err) {
      this.loggerService.error(err);
      throw new BadRequestException(err.message);
    }
  }

  @Get('guarded-route')
  @UseGuards(IsAuthenticatedGuard)
  async getGuardedRoute() {
    return {
      status: 'ok'
    };
  }
}
