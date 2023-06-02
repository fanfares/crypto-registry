import { Bip84Account } from './bip84-account';
import { exchangeMnemonic } from './exchange-mnemonic';
import { Network } from '@bcr/types';
import { Logger } from '@nestjs/common';
import { BitcoinService, AmountSentBySender, Transaction } from './bitcoin.service';


export class MockBitcoinService extends BitcoinService {

  calls = 0;

  constructor(
    private addressesWithBalance: number,
    protected logger: Logger,
    protected network: Network,
    private startingAddressIndex: number
  ) {
    super(logger, network);
    this.calls = this.startingAddressIndex;
  }

  async getAddressBalance(address: string): Promise<number> { // eslint-disable-line
    this.calls++;
    if (this.calls <= this.addressesWithBalance) {
      return 1000;
    } else {
      return 0;
    }
  }

  getTransaction(txid: string): Promise<Transaction> { // eslint-disable-line
    return Promise.resolve(undefined);
  }

  getTransactionsForAddress(address: string): Promise<Transaction[]> { // eslint-disable-line
    return Promise.resolve([]);
  }

  getLatestBlock(): Promise<string> {
    return Promise.resolve('');
  }

  addressHasTransactions(address: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getAmountSentBySender(
    address: string,
    searchZpub: string
  ): Promise<AmountSentBySender> {
    return Promise.resolve(undefined);
  }
}

describe('get-wallet-balance', () => {
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);

  test('wallet balance with more than 20 addresses', async () => {
    const logger = new Logger();
    const bitcoinService = new MockBitcoinService(30, logger, Network.testnet, 0);
    const balance = await bitcoinService.getWalletBalance(exchangeZpub);
    expect(balance).toBe(30 * 1000);
  });

  test('wallet balance with more than 20 addresses', async () => {
    const logger = new Logger();
    const bitcoinService = new MockBitcoinService(30, logger, Network.testnet, 50);
    const balance = await bitcoinService.getWalletBalance(exchangeZpub);
    expect(balance).toBe(0);
  });

});
