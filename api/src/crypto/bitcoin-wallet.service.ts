import { WalletService } from './wallet.service';
import { Logger, Injectable } from '@nestjs/common';
import { generateAddress } from './generate-address';
import { DbService } from '../db/db.service';
import { Network } from '@bcr/types';

@Injectable()
export class BitcoinWalletService extends WalletService {
  private logger = new Logger(BitcoinWalletService.name);

  constructor(
    private db: DbService
  ) {
    super();
  }

  async getReceivingAddress(
    receiverZpub: string,
    receiverName: string,
    network: Network
  ): Promise<string> {
    const currentCount = await this.db.walletAddresses.count({
      zpub: receiverZpub,
      network: network
    });
    this.logger.log('get receiving address', {
      receiverZpub, receiverName, currentCount, network
    });
    const address = generateAddress(receiverZpub, currentCount, false);
    await this.db.walletAddresses.insert({
      address: address, zpub: receiverZpub, network
    });
    return address;
  }

  sendFunds(senderZpub: string, toAddress: string, amount: number): Promise<void> { // eslint-disable-line
    return Promise.reject("Not implemented");
  }

  async storeReceivingAddress(
      receiverZpub: string,
      receiverName: string,
      network: Network,
      receivingAddress: string) {
    const existingAddress = await this.db.walletAddresses.findOne({
      address: receivingAddress
    })

    if ( existingAddress ) {
      this.logger.warn('receiving address already stored', {
        receivingAddress, receiverZpub, network
      })
      return;
    }

    await this.db.walletAddresses.insert({
      address: receivingAddress,
      zpub: receiverZpub,
      network: network
    });
  }

  async isUsedAddress(receivingAddress: string): Promise<boolean> {
    const address = await this.db.walletAddresses.findOne({
      address: receivingAddress
    })
    return !!address
  }

}
