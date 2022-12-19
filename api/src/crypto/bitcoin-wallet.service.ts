import { WalletService } from './wallet.service';
import { SubmissionDbService } from '../submission';
import { Logger, Injectable } from '@nestjs/common';
import { generateAddress } from './generate-address';

@Injectable()
export class BitcoinWalletService extends WalletService {
  private logger = new Logger(BitcoinWalletService.name);

  constructor(
    private submissionDbService: SubmissionDbService
  ) {
    super();
  }

  async getReceivingAddress(receiverZpub: string, receiverName: string): Promise<string> {
    this.logger.log('get receiving address', {
      receiverZpub, receiverName
    });
    const submissionCount = await this.submissionDbService.count({
      zpub: receiverZpub,
      forChange: false
    });
    return generateAddress(receiverZpub, submissionCount, false);
  }

  sendFunds(senderZpub: string, toAddress: string, amount: number): Promise<void> { // eslint-disable-line
    return Promise.reject("Not implemented");
  }

}
