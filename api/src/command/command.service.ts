import { Injectable, Logger } from '@nestjs/common';
import { FundingService } from '../funding';

@Injectable()
export class CommandService {
  private logger = new Logger(CommandService.name);

  constructor(
    private fundingService: FundingService,
  ) {
  }

  async runCommand() {
    const args = process.argv.slice(2)
    this.logger.log('Running command with arguments:', args);
    if ( args[0] === 'refresh-balances') {
      await this.fundingService.refreshAllBalances()
    }
  }
}
