import { Injectable, Logger } from '@nestjs/common';
import { FundingSubmissionService } from '../funding';
import { Cron } from '@nestjs/schedule';
import { ApiConfigService } from '../api-config';

@Injectable()
export class ControlService {

  constructor(
    private logger: Logger,
    private addressSubmissionService: FundingSubmissionService,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Cron('*/10 * * * * *')
  async execute() {
    try {
      if ( this.apiConfigService.isFundingServiceActive ) {
        await this.addressSubmissionService.executionCycle();
      }
    } catch (err) {
      this.logger.error(err);
    }
  }
}
