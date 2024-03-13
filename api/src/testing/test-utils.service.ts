import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ResetDataOptions } from '@bcr/types';
import { createTestData } from './create-test-data';
import { ApiConfigService } from '../api-config';
import { NodeService } from '../node';
import { resetNetwork } from './reset-network';
import { BitcoinService, WalletService } from '../bitcoin-service';

@Injectable()
export class TestUtilsService {

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private nodeService: NodeService,
    private bitcoinService: BitcoinService,
    private walletService: WalletService,
    private logger: Logger
  ) {
  }

  async resetNode(options: ResetDataOptions): Promise<void> {
    this.logger.log('Reset node', options);
    let optionsToUse = {...options};
    if (optionsToUse.resetNetwork) {
      await resetNetwork(options.nodes, this.dbService,
        this.nodeService, options.emitResetNetwork,
        this.apiConfigService.nodeAddress,
        options.resetWallet,
        this.logger);
      optionsToUse = {
        ...optionsToUse,
        resetChains: true
      };
    }

    await createTestData(this.dbService, this.bitcoinService, this.apiConfigService, this.walletService, optionsToUse);
  }
}
