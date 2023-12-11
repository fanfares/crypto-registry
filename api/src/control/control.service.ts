import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AbstractSubmissionService } from '../submission';
import { SyncService } from '../syncronisation/sync.service';
import { NodeService } from '../node';
import { Cron } from '@nestjs/schedule';
import { Network } from '@bcr/types';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { ApiConfigService } from '../api-config';

@Injectable()
export class ControlService implements OnModuleInit {

  isWorking = false;

  constructor(
    private logger: Logger,
    private syncService: SyncService,
    private submissionService: AbstractSubmissionService,
    private nodeService: NodeService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private configService: ApiConfigService
  ) {
  }

  async onModuleInit() {
    await this.nodeService.startUp();
  }

  @Cron('*/10 * * * * *')
  async execute() {
    const bitcoinService = this.bitcoinServiceFactory.getService(Network.testnet);

    if ( bitcoinService ) {
      await bitcoinService.testService();
    } else {
      this.logger.error('No bitcoin service for testnet');
    }

    if (this.isWorking) {
      this.logger.log('control-service isWorking flag set - skip execution');
      return;
    }

    this.isWorking = true;

    try {
      this.logger.log('network is up');
      await this.nodeService.updateLeader();
      await this.submissionService.executionCycle();

      if (!this.configService.isSingleNodeService) {
        await this.syncService.execute();
      }
    } catch (err) {
      this.logger.error(err);
    }
    this.isWorking = false;
    this.logger.log('control-service: execution complete');
  }
}
