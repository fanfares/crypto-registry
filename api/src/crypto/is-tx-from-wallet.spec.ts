import { Bip84Account } from './bip84-account';
import { exchangeMnemonic, registryMnemonic } from './exchange-mnemonic';
import { Transaction } from './bitcoin.service';
import { generateAddress } from './generate-address';
import { isTxSenderFromWallet } from './is-tx-sender-from-wallet';

describe('is-tx-sender-from-wallet', () => {
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);

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
