import { BadRequestException, Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Network, SendTestEmailDto, ServiceTestResultDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { IsAuthenticatedGuard, IsSystemAdminGuard } from '../auth';
import { subDays } from 'date-fns';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { ObjectId } from 'mongodb';
import { satoshiInBitcoin } from '../utils';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';

@Controller('test')
@ApiTags('test')
export class TestController {
  constructor(
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private logger: Logger,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private bitcoinCoreApiFactory: BitcoinCoreApiFactory
  ) {
  }

  @Get('service-test')
  @ApiResponse({ type: ServiceTestResultDto })
  // @UseGuards(IsSystemAdminGuard)
  async testBitcoinService(): Promise<ServiceTestResultDto> {
    let electrumxMainnet = false, electrumxTestnet = false, bitcoinCoreMainnet = false, bitcoinCoreTestnet = false;

    try {
      electrumxMainnet = await this.bitcoinServiceFactory.getService(Network.mainnet).testService() > 0
    } catch ( err ) {
      this.logger.error('ElectrumX Mainnet Down')
    }

    try {
      electrumxTestnet = await this.bitcoinServiceFactory.getService(Network.testnet).testService() > 0
    } catch ( err ) {
      this.logger.error('ElectrumX Testnet Down')
    }

    try {
      bitcoinCoreMainnet = !!await this.bitcoinCoreApiFactory.getApi(Network.mainnet).getBestBlockHash()
    } catch ( err ) {
      this.logger.error('Bitcoin Core Mainnet Down')
    }

    try {
      bitcoinCoreTestnet = !!await this.bitcoinCoreApiFactory.getApi(Network.testnet).getBestBlockHash()
    } catch ( err ) {
      this.logger.error('Bitcoin Core Testnet Down')
    }

    return {
      electrumxTestnet, electrumxMainnet, bitcoinCoreMainnet, bitcoinCoreTestnet
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
}
