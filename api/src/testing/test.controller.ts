import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Network, ResetNodeOptions, SendFundsDto, SendTestEmailDto, ZpubDto } from '@bcr/types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { TestUtilsService } from './test-utils.service';
import { IsAuthenticatedGuard } from '../user/is-authenticated.guard';
import { IsAdminGuard } from '../user/is-admin.guard';
import { subDays } from 'date-fns';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeService } from '../node';
import { Response } from 'express';
import { Bip84Utils } from '../crypto/bip84-utils';
import { getSignedAddresses } from '../crypto/get-signed-addresses';
import { getSigningMessage } from '../crypto/get-signing-message';

@Controller('test')
@ApiTags('test')
export class TestController {
  constructor(
    private testUtilsService: TestUtilsService,
    private db: DbService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private walletService: WalletService,
    private loggerService: Logger,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private nodeService: NodeService
  ) {
  }

  @Post('generate-test-address-file')
  @UseGuards(IsAdminGuard)
  @ApiBody({type: ZpubDto})
  async generateTestAddressFile(
    @Res() res: Response,
    @Body() body: ZpubDto
  ) {
    let data = 'address, signature\n';
    const fileName = `${body.zpub}.csv`;
    const bitcoinService = this.bitcoinServiceFactory.getService(Bip84Utils.fromExtendedKey(body.zpub).network);
    const signedAddresses = await getSignedAddresses(body.zpub, getSigningMessage(), bitcoinService)

    for (const signedAddress of signedAddresses) {
      data += `${signedAddress.address}, ${signedAddress.signature}\n`;
    }

    res.setHeader('access-control-expose-headers', 'content-disposition');
    res.setHeader('content-disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/plain');
    res.end(data);
  }

  @Get('test-electrum/:network')
  @UseGuards(IsAdminGuard)
  async testBitcoinService(
    @Param('network') network: Network
  ) {
    return await this.bitcoinServiceFactory.getService(network).testService()
  }

  @Post('reset')
  @ApiBody({type: ResetNodeOptions})
  async resetDb(
    @Body() options: ResetNodeOptions,
  ) {
    await this.testUtilsService.resetNode({
      ...options,
      resetChains: true,
    });
    return {
      status: 'ok'
    };
  }

  @Post('reset-wallet-history')
  @UseGuards(IsAdminGuard)
  async resetWalletHistory() {
    await this.nodeService.resetWalletHistory();
  }

  @Post('send-test-verification-email')
  @ApiBody({type: SendTestEmailDto})
  @UseGuards(IsAdminGuard)
  async sendTestVerificationEmail(@Body() body: SendTestEmailDto) {
    try {
      await this.mailService.sendVerificationEmail(body.email, [{
        customerHoldingAmount: 22276400,
        exchangeName: 'Binance',
        submissionDate:  subDays(new Date(), 4)
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
