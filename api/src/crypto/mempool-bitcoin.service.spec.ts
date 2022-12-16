import { BitcoinService } from './bitcoin.service';
import { MempoolBitcoinService } from './mempool-bitcoin.service';
import { ApiConfigService } from '../api-config';
import { registryMnemonic } from './test-wallet-mnemonic';
import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';

describe('mempool-bitcoin-service', () => {
  let service: BitcoinService;
  const registryAddress1 = 'tb1qhkpu4e5pyy438hlfah0gq3gm22hgzr7lak6hwx';
  const txid = '5f8f5a1eae91e168d1c8c8e98709435d9b8a1e4757f780091fadcb6870cbf517';
  const registryZpub = getZpubFromMnemonic(registryMnemonic, 'password', 'testnet');

  beforeEach(async () => {
    service = new MempoolBitcoinService({
      registryZpub: registryZpub,
      network: 'testnet'
    } as ApiConfigService);
  });

  test('get balance', async () => {
    expect(await service.getAddressBalance(registryAddress1)).toBe(10000);
  });

  test('get source balance of exchange', async () => {
    const txs = await service.getTransactionsForAddress(registryAddress1);
    expect(txs[0].inputValue).toBe(976616);
  });

  test('get transaction', async () => {
    const tx = await service.getTransaction(txid);
    expect(tx.inputValue).toBe(976616);
  });

});
