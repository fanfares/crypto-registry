import { Bip84Utils } from './bip84-utils';
import { exchangeMnemonic } from './exchange-mnemonic';
import { isAddressFromWallet } from './is-address-from-wallet';
import { MockBitcoinService } from './mock-bitcoin.service';

describe('is-address-in-wallet', () => {
  const exchangeZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic);

  test('change address from wallet', async () => {
    const mockBitcoinService = new MockBitcoinService(null, null);
    const address = mockBitcoinService.getAddressGenerator(exchangeZpub).getAddress(23, true);
    expect(isAddressFromWallet(mockBitcoinService, address, exchangeZpub)).toBe(true);
  });

  test('receiving address from wallet', async () => {
    const mockBitcoinService = new MockBitcoinService(null, null);
    const address = mockBitcoinService.getAddressGenerator(exchangeZpub).getAddress(23, true);
    expect(isAddressFromWallet(mockBitcoinService, address, exchangeZpub)).toBe(true);
  });

});
