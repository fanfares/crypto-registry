import { Bip84Utils, exchangeMnemonic } from '../crypto';
import { BitcoinCoreBlock, Network, Transaction } from '@bcr/types';
import { Logger } from '@nestjs/common';
import { TestLoggerService } from '../utils/logging';
import { AbstractBitcoinService } from './abstract-bitcoin.service';


class MockBitcoinService extends AbstractBitcoinService {
  calls = 0;

  constructor(
    private addressesWithBalance: number,
    protected network: Network,
    private startingAddressIndex: number
  ) {
    super(new Logger(MockBitcoinService.name), network, 'test-mock');
    this.calls = this.startingAddressIndex;
  }

  async getAddressBalance(): Promise<number> {
    this.calls++;
    if (this.calls <= this.addressesWithBalance) {
      return 1000;
    } else {
      return 0;
    }
  }

  getTransaction(): Promise<Transaction> {
    return Promise.resolve(undefined);
  }

  getTransactionsForAddress(): Promise<Transaction[]> {
    return Promise.resolve([]);
  }

  getLatestBlock(): Promise<string> {
    return Promise.resolve('');
  }

  getBlockDetails(): Promise<BitcoinCoreBlock> {
    throw new Error('Method not implemented.');
  }
}

describe('get-wallet-balance', () => {
  const exchangeZpub = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');

  test('wallet balance with more than 20 addresses', async () => {
    const bitcoinService = new MockBitcoinService(30, Network.testnet, 0);
    const balance = await bitcoinService.getWalletBalance(exchangeZpub);
    expect(balance).toBe(30 * 1000);
  });

  test('wallet balance with more than 20 addresses', async () => {
    const bitcoinService = new MockBitcoinService(30, Network.testnet, 50);
    const balance = await bitcoinService.getWalletBalance(exchangeZpub);
    expect(balance).toBe(0);
  });

});
