import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { SubmissionService } from "../submission";
import { SyncService } from "../syncronisation/sync.service";
import { NodeService } from "../node";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class ControlService implements OnModuleInit {

  isWorking = false;

  constructor(
    private logger: Logger,
    private syncService: SyncService,
    private submissionService: SubmissionService,
    private nodeService: NodeService
  ) {
  }

  async onModuleInit() {
    await this.nodeService.startUp()
    await this.syncService.startUp();
  }

  @Cron('10 * * * * *')
  async execute() {
    if (this.isWorking) {
      this.logger.log('Node is working - skip execution');
      return;
    }

    try {
      if (await this.syncService.isStarting()) {
        this.logger.log('Network starting up');
        await this.syncService.cronPing()
        return;
      }
      this.logger.log('Network is up');
      await this.submissionService.executionCycle()
      await this.syncService.cronPing()
    } catch (err) {
      this.logger.error(err)
    }
    this.isWorking = false;
    this.logger.log('Execution cycle complete');
  }
}
