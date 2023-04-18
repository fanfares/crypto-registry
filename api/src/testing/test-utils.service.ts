import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Network, ResetDataOptions } from '@bcr/types';
import { createTestData } from './create-test-data';
import { ApiConfigService } from '../api-config';
import { SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { MessageSenderService } from '../network/message-sender.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeService } from '../node';
import { EventGateway } from '../network/event.gateway';
import { resetNetwork } from './reset-network';

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
    private logger: Logger,
    private eventGateway: EventGateway
  ) {
  }

  async resetDb(options?: ResetDataOptions): Promise<void> {
    this.logger.log('Resetting Test Data');
    if (options?.resetNetwork) {
      await resetNetwork(options.nodes, this.dbService, options.emitResetNetwork, this.apiConfigService.nodeAddress);
    }

    await createTestData(
      this.dbService, this.apiConfigService,
      this.submissionService, this.walletService,
      this.messageSenderService, this.bitcoinServiceFactory,
      this.nodeService, options);
    this.eventGateway.emitNodes(await this.nodeService.getNodeDtos());
  }

  async resetWalletHistory(): Promise<void> {
    await this.walletService.resetHistory(this.apiConfigService.getRegistryZpub(Network.testnet), this.apiConfigService.bitcoinApi !== 'mock');
    await this.walletService.resetHistory(this.apiConfigService.getRegistryZpub(Network.mainnet), this.apiConfigService.bitcoinApi !== 'mock');
  }

}
