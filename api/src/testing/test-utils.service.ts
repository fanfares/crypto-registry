import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ResetDataOptions } from '@bcr/types';
import { createTestData } from './create-test-data';
import { ApiConfigService } from '../api-config';
import { NodeService } from '../node';
import { resetNetwork } from './reset-network';
import { BitcoinService, WalletService } from '../bitcoin-service';
import { ResetNetworkOptionsDto } from '../types/reset-network-options-dto.type';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class TestUtilsService {

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private nodeService: NodeService,
    private bitcoinService: BitcoinService,
    private walletService: WalletService,
    private logger: Logger,
    private exchangeService: ExchangeService
  ) {
  }

  async resetNode(
    options: ResetNetworkOptionsDto,
    dataOptions?: ResetDataOptions
  ): Promise<void> {
    this.logger.log('Reset node', options);
    let optionsToUse = {...options};
    if (optionsToUse.resetNetwork) {
      await resetNetwork(options.nodes, this.dbService,
        this.nodeService, options.emitResetNetwork,
        this.apiConfigService.nodeAddress,
        this.logger);
    }

    await createTestData(this.dbService, this.bitcoinService, this.walletService, this.exchangeService, dataOptions);
  }
}
