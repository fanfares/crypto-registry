import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { testWalletMnemonic } from './test-wallet-mnemonic';
import { getWalletBalance } from './get-wallet-balance';
import { MempoolBitcoinService } from './mempool-bitcoin.service';
import { ApiConfigService } from '../api-config';

describe('get-wallet-balance', () => {

  test('of test-wallet', async () => {
    const zpub = getZpubFromMnemonic(testWalletMnemonic, 'password', 'testnet');
    const bitcoinService = new MempoolBitcoinService({
      network: 'testnet'
    } as ApiConfigService)
    const walletBalance = await getWalletBalance(zpub, bitcoinService);
    expect(walletBalance).toBe(971940)
  })
})
