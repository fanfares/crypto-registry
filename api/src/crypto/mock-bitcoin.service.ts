import { BitcoinService, Transaction } from './bitcoin.service';
import { DbService } from '../db/db.service';
import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';

export class MockBitcoinService extends BitcoinService {
  constructor(
    private dbService: DbService,
    logger: Logger
  ) {
    super(logger, Network.testnet);
  }

  async getAddressBalance(address: string): Promise<number> {
    const addressData = await this.dbService.mockAddresses.findOne({
      address: address,
      unspent: true
    });
    return addressData?.balance ?? 0;
  }

  getTransaction(txid: string): Promise<Transaction> {
    return this.dbService.mockTransactions.findOne({ txid });
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> { // eslint-disable-line
    const txs = await this.dbService.mockTransactions.find({});
    return txs.filter(tx => {
      const inSide = tx.inputs.filter(input => input.address === address);
      if (inSide.length > 0) {
        return true;
      }
      const outSide = tx.outputs.filter(input => input.address === address);
      if (outSide.length) {
        return true;
      }
    });
  }
}
