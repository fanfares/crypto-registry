import { Bip84Account } from './bip84-account';
import { exchangeMnemonic } from './exchange-mnemonic';
import { Network } from '@bcr/types';
import { Logger } from '@nestjs/common';
import { TestLoggerService } from "../utils/logging";
import { BitcoinService, Transaction } from './bitcoin.service';


class MockBitcoinService extends BitcoinService {

  calls = 0;

  constructor(
    private addressesWithBalance: number,
    public logger: Logger,
    protected network: Network,
    private startingAddressIndex: number
  ) {
    super(logger, network, 'test-mock');
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
}

describe('get-wallet-balance', () => {
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  const logger = new TestLoggerService();

  test('wallet balance with more than 20 addresses', async () => {
    const bitcoinService = new MockBitcoinService(30, logger, Network.testnet, 0);
    const balance = await bitcoinService.getWalletBalance(exchangeZpub);
    expect(balance).toBe(30 * 1000);
  });

  test('wallet balance with more than 20 addresses', async () => {
    const bitcoinService = new MockBitcoinService(30, logger, Network.testnet, 50);
    const balance = await bitcoinService.getWalletBalance(exchangeZpub);
    expect(balance).toBe(0);
  });

});
