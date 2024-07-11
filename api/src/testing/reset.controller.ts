import { Controller, Post, UseGuards } from '@nestjs/common';
import { IsLocalGuard } from '../auth/is-local-guard';
import { Network } from '@bcr/types';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { WalletService } from '../bitcoin-service';
import { ExchangeService } from '../exchange/exchange.service';
import { createTestData } from './create-test-data';
import { ApiTags } from '@nestjs/swagger';

@Controller('reset')
@ApiTags('reset')
@UseGuards(IsLocalGuard)
export class ResetController {

  constructor(
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private db: DbService,
    private walletService: WalletService,
    private exchangeService: ExchangeService
  ) {
  }

  @Post()
  async reset() {
    const bitcoinService = this.bitcoinServiceFactory.getService(Network.testnet);
    await createTestData(this.db, bitcoinService, this.walletService, this.exchangeService, {
      retainUsers: true,
      createDefaultUsers: true,
      numberOfFundingAddresses: 50,
      numberOfHoldings: 10,
      numberOfExchanges: 1
    });
  }
}
