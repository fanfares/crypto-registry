import { WalletService } from './wallet.service';
import { Logger, Injectable } from '@nestjs/common';
import { generateAddress } from './generate-address';
import { DbService } from '../db/db.service';

@Injectable()
export class BitcoinWalletService extends WalletService {
  private logger = new Logger(BitcoinWalletService.name);

  constructor(
    private dbService: DbService
  ) {
    super();
  }

  async getReceivingAddress(receiverZpub: string, receiverName: string): Promise<string> {
    this.logger.log('get receiving address', {
      receiverZpub, receiverName
    });
    const submissionCount = await this.dbService.submissions.count({
      zpub: receiverZpub,
      forChange: false
    });
    return generateAddress(receiverZpub, submissionCount, false);
  }

  sendFunds(senderZpub: string, toAddress: string, amount: number): Promise<void> { // eslint-disable-line
    return Promise.reject("Not implemented");
  }

}
