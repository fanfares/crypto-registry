import { WalletService } from './wallet.service';
import { Logger, Injectable } from '@nestjs/common';
import { generateAddress } from './generate-address';
import { DbService } from '../db/db.service';
import { Network } from '@bcr/types';

@Injectable()
export class BitcoinWalletService extends WalletService {
  private logger = new Logger(BitcoinWalletService.name);

  constructor(
    private dbService: DbService
  ) {
    super();
  }

  async getReceivingAddress(
    receiverZpub: string,
    receiverName: string,
    network: Network
  ): Promise<string> {
    const currentCount = await this.dbService.walletAddresses.count({
      zpub: receiverZpub,
      network: network
    });
    this.logger.log('get receiving address', {
      receiverZpub, receiverName, index: currentCount, network
    });
    const address = generateAddress(receiverZpub, currentCount, false);
    await this.dbService.walletAddresses.insert({
      address: address, zpub: receiverZpub, index: currentCount, network
    });
    return address;
  }

  sendFunds(senderZpub: string, toAddress: string, amount: number): Promise<void> { // eslint-disable-line
    return Promise.reject("Not implemented");
  }

}
