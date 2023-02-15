import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ResetDataOptions } from '@bcr/types';
import { createTestData, TestIds } from './create-test-data';
import { ApiConfigService } from '../api-config';
import { SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { MessageSenderService } from '../network/message-sender.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';

@Injectable()
export class TestUtilsService {

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private submissionService: SubmissionService,
    private walletService: WalletService,
    private messageSenderService: MessageSenderService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private logger: Logger
  ) {
  }

  async resetTestData(options?: ResetDataOptions): Promise<TestIds> {
    this.logger.log('Resetting Test Data');
    return await createTestData(this.dbService, this.apiConfigService,
      this.submissionService, this.walletService,
      this.messageSenderService, this.bitcoinServiceFactory, options);
  }
}
