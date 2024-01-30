import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { FundingSubmissionService } from '../funding-submission';

@Injectable()
export class ControlService {

  isWorking = false;

  constructor(
    private logger: Logger,
    // private syncService: SyncService,
    private addressSubmissionService: FundingSubmissionService,
    // private nodeService: NodeService,
    private bitcoinServiceFactory: BitcoinServiceFactory
    // private configService: ApiConfigService
  ) {
  }

  // async onModuleInit() {
  // await this.nodeService.startUp();
  // }

  @Cron('*/10 * * * * *')
  async execute() {
    // const bitcoinService = this.bitcoinServiceFactory.getService(Network.testnet);
    //
    // if ( bitcoinService ) {
    //   await bitcoinService.testService();
    // } else {
    //   this.logger.error('No bitcoin service for testnet');
    // }

    if (this.isWorking) {
      this.logger.log('control-service isWorking flag set - skip execution');
      return;
    }

    this.isWorking = true;

    try {
      // this.logger.log('network is up');
      // await this.nodeService.updateLeader();
      await this.addressSubmissionService.executionCycle();

      // if (!this.configService.isSingleNodeService) {
      // await this.syncService.execute();
      // }
    } catch (err) {
      this.logger.error(err);
    }
    this.isWorking = false;
  }
}
