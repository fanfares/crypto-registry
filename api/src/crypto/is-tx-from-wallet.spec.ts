import { Bip84Utils } from './bip84-utils';
import { exchangeMnemonic, registryMnemonic } from './exchange-mnemonic';
import { Transaction } from './bitcoin.service';
import { isTxSenderFromWallet } from './is-tx-sender-from-wallet';
import { MockBitcoinService } from './mock-bitcoin.service';
import { Network } from '@bcr/types';

describe('is-tx-sender-from-wallet', () => {
  const exchangeZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic, Network.testnet);
  const registryZpub = Bip84Utils.zpubFromMnemonic(registryMnemonic, Network.testnet, 'password');

  test('tx is from wallet', async () => {
    const mockBitcoinService = new MockBitcoinService(null, null);
    const address = mockBitcoinService.getAddressGenerator(exchangeZpub).getAddress(23, true);
    const transaction = new Transaction();
    transaction.inputs = [{
      address: address,
      txid: '123',
      value: 1000,
      outputIndex: 0
    }];
    expect(isTxSenderFromWallet(mockBitcoinService, transaction, exchangeZpub)).toBe(true);
  });

  test('tx is not from wallet', async () => {
    const mockBitcoinService = new MockBitcoinService(null, null);
    const address = mockBitcoinService.getAddressGenerator(registryZpub).getAddress(23, true);
    const transaction = new Transaction();
    transaction.inputs = [{
      address: address,
      txid: '123',
      value: 1000,
      outputIndex: 0
    }];
    expect(isTxSenderFromWallet(mockBitcoinService, transaction, exchangeZpub)).toBe(false);
  });
});
