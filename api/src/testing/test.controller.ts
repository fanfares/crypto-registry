import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GenerateAddressFileDto, Network, SendFundsDto, SendTestEmailDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';
import { IsAuthenticatedGuard, IsSystemAdminGuard } from '../user';
import { subDays } from 'date-fns';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { Response } from 'express';
import { Bip84Utils } from '../crypto/bip84-utils';
import { getSignedAddresses } from '../crypto/get-signed-addresses';
import { getSigningMessage } from '../crypto/get-signing-message';
import { ObjectId } from 'mongodb';
import { satoshiInBitcoin } from '../utils';
import { TestService } from './test.service';

@Controller('test')
@ApiTags('test')
@UseGuards(IsSystemAdminGuard)
export class TestController {
  constructor(
    private testService: TestService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private walletService: WalletService,
    private loggerService: Logger,
    private bitcoinServiceFactory: BitcoinServiceFactory
  ) {
  }

  @Post('generate-test-address-file')
  @ApiBody({type: GenerateAddressFileDto})
  async generateTestAddressFile(
    @Res() res: Response,
    @Body() body: GenerateAddressFileDto
  ) {
    try {
      let data = 'address, signature\n';
      const fileName = `${body.zprv}.csv`;
      const bitcoinService = this.bitcoinServiceFactory.getService(Bip84Utils.fromExtendedKey(body.zprv).network);
      const signedAddresses = await getSignedAddresses(body.zprv, getSigningMessage(), bitcoinService);

      for (const signedAddress of signedAddresses) {
        data += `${signedAddress.address}, ${signedAddress.signature}\n`;
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
        holdingId: new ObjectId(),
        customerHoldingAmount: 10.5667 * satoshiInBitcoin,
        exchangeName: 'Binance',
        fundingAsAt: subDays(new Date(), 4),
        fundingSource: Network.testnet
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
}
