import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Network, ResetNodeOptions } from '@bcr/types';
import { createTestData } from './create-test-data';
import { ApiConfigService } from '../api-config';
import { AbstractSubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { MessageSenderService } from '../network/message-sender.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeService } from '../node';
import { resetNetwork } from './reset-network';

@Injectable()
export class TestUtilsService {

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private submissionService: AbstractSubmissionService,
    private walletService: WalletService,
    private messageSenderService: MessageSenderService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private nodeService: NodeService,
    private logger: Logger
  ) {
  }

  async resetNode(options: ResetNodeOptions): Promise<void> {
    this.logger.log('Reset node', options);
    let optionsToUse = {...options}
    if (optionsToUse.resetNetwork) {
      await resetNetwork(options.nodes, this.dbService,
        this.nodeService, options.emitResetNetwork,
        this.apiConfigService.nodeAddress,
        options.resetWallet,
        options.autoStart,
        this.logger);
      optionsToUse = {
        ...optionsToUse,
        resetAll: false,
        resetChains: true,
      }
    }

    await createTestData(
      this.dbService, this.apiConfigService, this.walletService,
      this.nodeService, optionsToUse
    );

    await this.nodeService.emitNodes();
  }

  async resetWalletHistory(): Promise<void> {
    await this.walletService.resetHistory(this.apiConfigService.getRegistryZpub(Network.testnet), this.apiConfigService.bitcoinApi !== 'mock');
    await this.walletService.resetHistory(this.apiConfigService.getRegistryZpub(Network.mainnet), this.apiConfigService.bitcoinApi !== 'mock');
  }

}
