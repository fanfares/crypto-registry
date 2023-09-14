import { Bip84Account } from './bip84-account';
import { exchangeMnemonic, registryMnemonic } from './exchange-mnemonic';
import { Transaction } from './bitcoin.service';
import { isTxSenderFromWallet } from './is-tx-sender-from-wallet';
import { MockBitcoinService } from "./mock-bitcoin.service";

describe('is-tx-sender-from-wallet', () => {
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);

  test('tx is from wallet', async () => {
    const mockBitcoinService = new MockBitcoinService(null, null)
    const address = mockBitcoinService.getAddress(exchangeZpub, 23, true);
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
    const mockBitcoinService = new MockBitcoinService(null, null)
    const address = mockBitcoinService.getAddress(registryZpub, 23, true);
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
