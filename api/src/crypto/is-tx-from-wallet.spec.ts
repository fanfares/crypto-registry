import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { exchangeMnemonic, registryMnemonic } from './test-wallet-mnemonic';
import { Transaction } from './bitcoin.service';
import { generateAddress } from './generate-address';
import { isTxSenderFromWallet } from './is-tx-sender-from-wallet';

describe('is-tx-sender-from-wallet', () => {
  const exchangeZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', 'testnet');
  const registryZpub = getZpubFromMnemonic(registryMnemonic, 'password', 'testnet');

  test('tx is from wallet', async () => {
    const address = generateAddress(exchangeZpub, 23, true);
    const transaction = new Transaction();
    transaction.inputs = [{
      address: address,
      txid: '123',
      value: 1000
    }];
    expect(isTxSenderFromWallet(transaction, exchangeZpub)).toBe(true);
  });

  test('tx is not from wallet', async () => {
    const address = generateAddress(registryZpub, 23, true);
    const transaction = new Transaction();
    transaction.inputs = [{
      address: address,
      txid: '123',
      value: 1000
    }];
    expect(isTxSenderFromWallet(transaction, exchangeZpub)).toBe(false);
  });
});
