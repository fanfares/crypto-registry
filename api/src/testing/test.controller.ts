import { BadRequestException, Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Network,
  SendTestEmailDto,
  ServiceTestRequestDto,
  ServiceTestResultDto,
} from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { IsAuthenticatedGuard, IsSystemAdminGuard } from '../auth';
import { subDays } from 'date-fns';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { ObjectId } from 'mongodb';
import { satoshiInBitcoin } from '../utils';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';
import { executeServiceTests } from './execute-service-tests';

@Controller('test')
@ApiTags('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private bitcoinCoreApiFactory: BitcoinCoreApiFactory
  ) {
  }

  @Post('service-test')
  @ApiResponse({type: ServiceTestResultDto})
  @ApiBody({type: ServiceTestRequestDto})
  @UseGuards(IsSystemAdminGuard)
  async testBitcoinService(
    @Body() request: ServiceTestRequestDto
  ): Promise<ServiceTestResultDto> {
    return await executeServiceTests(
      this.bitcoinServiceFactory,
      this.bitcoinCoreApiFactory,
      this.logger, request);
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
      this.logger.error(err);
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

  @Get('log-error')
  @UseGuards(IsAuthenticatedGuard)
  async logError() {
    this.logger.log('Test Log', {
      time: new Date().toISOString()
    });
    this.logger.error('Test Error', {
      time: new Date().toISOString()
    });
    this.logger.warn('Test Warn', {
      time: new Date().toISOString()
    });
    this.logger.debug('Test Debug', {
      time: new Date().toISOString()
    });
  }
}
