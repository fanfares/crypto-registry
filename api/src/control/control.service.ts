import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AbstractSubmissionService } from "../submission";
import { SyncService } from "../syncronisation/sync.service";
import { NodeService } from "../node";
import { Cron } from "@nestjs/schedule";
import { Network } from "@bcr/types";
import { BitcoinServiceFactory } from "../crypto/bitcoin-service-factory";
import { ApiConfigService } from "../api-config";

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
    await this.nodeService.startUp()

    if (!this.configService.isSingleNodeService) {
      await this.syncService.startUp();
    }
  }

  @Cron('*/10 * * * * *')
  async execute() {
    const bitcoinService = this.bitcoinServiceFactory.getService(Network.testnet)
    await bitcoinService.testService();

    if (this.isWorking) {
      this.logger.log('Node is working - skip execution');
      return;
    }

    this.isWorking = true;

    try {
      if (await this.syncService.isStarting() && !this.configService.isSingleNodeService) {
        this.logger.log('Network starting up');
        await this.syncService.cronPing()
        return;
      }
      this.logger.log('Network is up');
      await this.submissionService.executionCycle()

      if (!this.configService.isSingleNodeService) {
        await this.syncService.cronPing()
      }
    } catch (err) {
      this.logger.error(err)
    }
    this.isWorking = false;
    this.logger.log('Execution cycle complete');
  }
}
