import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GenerateAddressFileDto, Network, SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { getSignedAddresses } from '../bitcoin-service';
import { IsAuthenticatedGuard, IsSystemAdminGuard } from '../auth';
import { subDays } from 'date-fns';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { Response } from 'express';
import { Bip84Utils } from '../crypto';
import { ObjectId } from 'mongodb';
import { satoshiInBitcoin } from '../utils';
import { TestService } from './test.service';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';

// import { ControlService } from '../control';

@Controller('test')
@ApiTags('test')
@UseGuards(IsSystemAdminGuard)
export class TestController {
  constructor(
    private testService: TestService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private loggerService: Logger,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private bitcoinCoreApiFactory: BitcoinCoreApiFactory
  ) {
  }

  @Post('generate-test-address-file')
  @ApiBody({type: GenerateAddressFileDto})
  async generateTestAddressFile(
    @Res() res: Response,
    @Body() body: GenerateAddressFileDto
  ) {
    try {
      let data = 'message, address, signature\n';
      const fileName = `${body.extendedPrivateKey}.csv`;
      const bitcoinService = this.bitcoinServiceFactory.getService(Bip84Utils.fromExtendedKey(body.extendedPrivateKey).network);
      const signedAddresses = await getSignedAddresses(body.extendedPrivateKey, body.message, bitcoinService);
      for (const signedAddress of signedAddresses) {
        data += `${body.message}, ${signedAddress.address}, ${signedAddress.signature}\n`;
      }
      res.setHeader('access-control-expose-headers', 'content-disposition');
      res.setHeader('content-disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'text/plain');
      res.end(data);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
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
  async resetDb() {
    await this.testService.resetDb();
    return {
      status: 'ok'
    };
  }

  @Post('send-test-verification-email')
  @ApiBody({type: SendTestEmailDto})
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

  // @Post('send-funds')
  // @ApiBody({type: SendFundsDto})
  // async sendFunds(
  //   @Body() body: SendFundsDto
  // ) {
  //   await this.walletService.sendFunds(body.senderZpub, body.toAddress, body.amount);
  //   return {
  //     status: 'success'
  //   };
  // }

  @Get('guarded-route')
  @UseGuards(IsAuthenticatedGuard)
  async getGuardedRoute() {
    return {
      status: 'ok'
    };
  }
}
