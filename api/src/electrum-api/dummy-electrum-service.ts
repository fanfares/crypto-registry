import { BitcoinService, Transaction } from '../crypto';
import { Network } from '@bcr/types';

export class DummyElectrumService extends BitcoinService {
  constructor(
    network: Network
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

}
