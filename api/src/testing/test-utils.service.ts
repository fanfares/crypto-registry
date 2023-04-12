import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Network, ResetDataOptions } from '@bcr/types';
import { createTestData } from './create-test-data';
import { ApiConfigService } from '../api-config';
import { SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { MessageSenderService } from '../network/message-sender.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { resetRegistryWalletHistory } from '../crypto/reset-registry-wallet-history';
import { NodeService } from '../node';

@Injectable()
export class TestUtilsService {

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private submissionService: SubmissionService,
    private walletService: WalletService,
    private messageSenderService: MessageSenderService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private nodeService: NodeService,
    private logger: Logger
  ) {
  }

  async resetDb(options?: ResetDataOptions): Promise<void> {
    this.logger.log('Resetting Test Data');
    await createTestData(
      this.dbService, this.apiConfigService,
      this.submissionService, this.walletService,
      this.messageSenderService, this.bitcoinServiceFactory,
      this.nodeService, options);
  }

  async resetWalletHistory(): Promise<void> {
    await resetRegistryWalletHistory(this.dbService, this.apiConfigService, this.bitcoinServiceFactory, Network.testnet);
    await resetRegistryWalletHistory(this.dbService, this.apiConfigService, this.bitcoinServiceFactory, Network.mainnet);
  }

}
