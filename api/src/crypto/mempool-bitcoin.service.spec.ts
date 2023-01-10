import { BitcoinService } from './bitcoin.service';
import { MempoolBitcoinService } from './mempool-bitcoin.service';
import { exchangeMnemonic } from './exchange-mnemonic';
import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { isTxSenderFromWallet } from './is-tx-sender-from-wallet';
import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';

describe('mempool-bitcoin-service', () => {
  let service: BitcoinService;
  const registryAddress1 = 'tb1qhkpu4e5pyy438hlfah0gq3gm22hgzr7lak6hwx';
  const txid = '5f8f5a1eae91e168d1c8c8e98709435d9b8a1e4757f780091fadcb6870cbf517';
  const exchangeZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', Network.testnet);
  // const registryZpub = getZpubFromMnemonic(registryMnemonic, 'password', Network.testnet);

  beforeEach(async () => {
    service = new MempoolBitcoinService(Network.testnet, new Logger());
  });

  test('get balance', async () => {
    expect(await service.getAddressBalance(registryAddress1)).toBe(10000);
  });

  test('get exchange input balance', async () => {
    const txs = await service.getTransactionsForAddress(registryAddress1);
    expect(txs[0].inputValue).toBe(976616);
    expect(isTxSenderFromWallet(txs[0], exchangeZpub)).toBe(true);
  });

  test('check sender is from exchange', async () => {
    const txs = await service.getTransactionsForAddress(registryAddress1);
    expect(isTxSenderFromWallet(txs[0], exchangeZpub)).toBe(true);
  });

  test('get transaction', async () => {
    const tx = await service.getTransaction(txid);
    expect(tx.inputValue).toBe(976616);
  });

  test.skip('get wallet balance', async () => {
    const zpub = getZpubFromMnemonic(exchangeMnemonic, 'password', Network.testnet);
    const walletBalance = await service.getWalletBalance(zpub);
    expect(walletBalance).toBe(42960);
  });
});
