import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { testWalletMnemonic } from './test-wallet-mnemonic';
import { getWalletBalance } from './get-wallet-balance';
import { MempoolBitcoinService } from './mempool-bitcoin.service';
import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';

describe('get-wallet-balance', () => {
  test('of test-wallet with mempool', async () => {
    const zpub = getZpubFromMnemonic(testWalletMnemonic, 'password', Network.testnet);
    const logger = new Logger();
    const bitcoinService = new MempoolBitcoinService(Network.testnet, logger);
    const walletBalance = await getWalletBalance(zpub, bitcoinService, logger, Network.testnet);
    expect(walletBalance).toBe(42960);
  });
});
