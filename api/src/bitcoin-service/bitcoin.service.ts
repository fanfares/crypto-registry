import { BitcoinCoreBlock, Network, Transaction } from '@bcr/types';

export interface BitcoinService {
  destroy(): void;

  disconnect(): void;

  getAddressBalance(address: string): Promise<number>;

  getAddressBalances(addresses: string[]): Promise<Map<string, number>>;

  getLatestBlock(): Promise<string>;

  getTransaction(txid: string): Promise<Transaction>;

  getTransactionsForAddress(address: string): Promise<Transaction[]>;

  addressHasTransactions(address: string): Promise<boolean>;

  testService(): Promise<void>;

  getBlockDetails(blockHash: string, network: Network): Promise<BitcoinCoreBlock>;

  getWalletBalance(extendedPublicKey: string): Promise<number>;
}
