import { BitcoinCoreBlock, Network, Transaction } from '@bcr/types';
import { BitcoinService } from './bitcoin.service';

export class DummyBitcoinService extends BitcoinService {
  constructor(
    public network: Network
  ) {
    super(null, network, 'Dummy ');
  }

  getAddressBalance(address: string): Promise<number> {
    throw new Error(`${this.network} bitcoin node not ready`);
  }

  getTransaction(txid: string): Promise<Transaction> {
    throw new Error(`${this.network} bitcoin node not ready`);
  }

  getTransactionsForAddress(address: string): Promise<Transaction[]> {
    throw new Error(`${this.network} bitcoin node not ready`);
  }

  getLatestBlock(): Promise<string> {
    throw new Error(`${this.network} bitcoin node not ready`);
  }

  getBlockDetails(blockHash: string, network: Network): Promise<BitcoinCoreBlock> {
    throw new Error(`${this.network} bitcoin node not ready`);
  }

}
