import { Injectable, Logger } from '@nestjs/common';
import { FundingSubmissionService } from '../funding';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ControlService {

  constructor(
    private logger: Logger,
    private addressSubmissionService: FundingSubmissionService
  ) {
  }

  @Cron('*/10 * * * * *')
  async execute() {
    try {
      await this.addressSubmissionService.executionCycle();
    } catch (err) {
      this.logger.error(err);
    }
  }
}
