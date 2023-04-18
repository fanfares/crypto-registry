import { WalletService } from './wallet.service';
import { Injectable, Logger } from '@nestjs/common';
import { generateAddress } from './generate-address';
import { DbService } from '../db/db.service';
import { Network } from '@bcr/types';
import { Bip84Account } from "./bip84-account";
import { wait } from "../utils/wait";
import { WalletAddress } from "../types/wallet-address-db.types";
import { BitcoinServiceFactory } from "./bitcoin-service-factory";
import { getNetworkForZpub } from "./get-network-for-zpub";

@Injectable()
export class BitcoinWalletService extends WalletService {
  protected logger = new Logger(BitcoinWalletService.name);

  constructor(
    protected db: DbService,
    protected bitcoinServiceFactory: BitcoinServiceFactory,
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
    return Promise.reject('Not implemented');
  }

  async storeReceivingAddress(
    receiverZpub: string,
    receiverName: string,
    network: Network,
    receivingAddress: string) {
    const existingAddress = await this.db.walletAddresses.findOne({
      address: receivingAddress
    });

    if (existingAddress) {
      this.logger.warn('receiving address already stored', {
        receivingAddress, receiverZpub, network
      });
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
    });
    return !!address;
  }

  async getAddressCount(
    zpub: string,
    network: Network
  ): Promise<number> {
    return await this.db.walletAddresses.count({zpub, network});
  }

  async resetHistory(
    zpub: string,
    waitBetweenCalls = true
  ): Promise<void> {
    const network = getNetworkForZpub(zpub)
    const bitcoinService = this.bitcoinServiceFactory.getService(network);
    await this.db.walletAddresses.deleteMany({network: {$exists: false}});
    await this.db.walletAddresses.deleteMany({network});
    const account = new Bip84Account(zpub);

    let zeroTxAddresses = 0;
    let addressIndex = 0;
    while (zeroTxAddresses < 20) {
      const address = account.getAddress(addressIndex);
      const txs = await bitcoinService.getTransactionsForAddress(address);
      if (txs.length === 0) {
        zeroTxAddresses++;
      } else {
        zeroTxAddresses = 0;
      }
      if (waitBetweenCalls) {
        // todo - could we use a back-off on 429?
        await wait(1000);
      }
      addressIndex++;
    }

    const usedAddresses: WalletAddress [] = [];
    for (let index = 0; index < Math.max(0, addressIndex - 20); index++) {
      const address = account.getAddress(index);
      usedAddresses.push({
        zpub: zpub,
        address: address,
        network: network
      });
    }

    if (usedAddresses.length > 0) {
      await this.db.walletAddresses.insertMany(usedAddresses);
    }
  }
}
