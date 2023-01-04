import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { testWalletMnemonic } from './test-wallet-mnemonic';
import { getWalletBalance } from './get-wallet-balance';
import { MempoolBitcoinService } from './mempool-bitcoin.service';
import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';

describe('get-wallet-balance', () => {
  test('of test-wallet with mempool', async () => {
    const zpub = getZpubFromMnemonic(testWalletMnemonic, 'password', Network.testnet);
    const bitcoinService = new MempoolBitcoinService(Network.testnet, new Logger());
    const walletBalance = await getWalletBalance(zpub, bitcoinService);
    expect(walletBalance).toBe(42960);
  });
});
