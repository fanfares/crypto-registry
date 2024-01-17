import { Bip84Utils } from './bip84-utils';
import { exchangeMnemonic, registryMnemonic } from './exchange-mnemonic';
import { Transaction } from './bitcoin.service';
import { isTxSenderFromWallet } from './is-tx-sender-from-wallet';
import { Network } from '@bcr/types';

describe('is-tx-sender-from-wallet', () => {
  const exchangeZpub = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');
  const registryZpub = Bip84Utils.extendedPublicKeyFromMnemonic(registryMnemonic, Network.testnet, 'vpub','password');

  test('tx is from wallet', async () => {
    const address = Bip84Utils.fromExtendedKey(exchangeZpub).getAddress(23, true);
    const transaction = new Transaction();
    transaction.inputs = [{
      address: address,
      txid: '123',
      value: 1000,
      outputIndex: 0
    }];
    expect(isTxSenderFromWallet(transaction, exchangeZpub)).toBe(true);
  });

  test('tx is not from wallet', async () => {
    const address = Bip84Utils.fromExtendedKey(registryZpub).getAddress(23, true);
    const transaction = new Transaction();
    transaction.inputs = [{
      address: address,
      txid: '123',
      value: 1000,
      outputIndex: 0
    }];
    expect(isTxSenderFromWallet(transaction, exchangeZpub)).toBe(false);
  });
});
