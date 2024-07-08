import { Injectable, Logger } from '@nestjs/common';
import { FundingSubmissionService } from '../funding';

@Injectable()
export class CommandService {
  private logger = new Logger(CommandService.name);

  constructor(
    private fundingService: FundingSubmissionService,
  ) {
  }

  async runCommand() {
    const args = process.argv.slice(2)
    const x = await this.fundingService.getData();
    this.logger.log('Running command with arguments:', args);
    this.logger.log('The count is:', x);
    await this.fundingService.executionCycle()
  }
}
