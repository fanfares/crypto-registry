import { Bip84Account } from './bip84-account';
import { exchangeMnemonic } from './exchange-mnemonic';
import { isAddressFromWallet } from './is-address-from-wallet';
import { MockBitcoinService } from "./mock-bitcoin.service";

describe('is-address-in-wallet', () => {
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);

  test('change address from wallet', async () => {
    const mockBitcoinService = new MockBitcoinService(null, null)
    const address = mockBitcoinService.getAddress(exchangeZpub, 23, true);
    expect(isAddressFromWallet(mockBitcoinService, address, exchangeZpub)).toBe(true);
  });

  test('receiving address from wallet', async () => {
    const mockBitcoinService = new MockBitcoinService(null, null)
    const address = mockBitcoinService.getAddress(exchangeZpub, 23, true);
    expect(isAddressFromWallet(mockBitcoinService, address, exchangeZpub)).toBe(true);
  });

});
