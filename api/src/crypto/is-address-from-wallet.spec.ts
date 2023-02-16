import { Bip84Account } from './bip84-account';
import { exchangeMnemonic } from './exchange-mnemonic';
import { generateAddress } from './generate-address';
import { isAddressFromWallet } from './is-address-from-wallet';

describe('is-address-in-wallet', () => {
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);

  test('change address from wallet', async () => {
    const address = generateAddress(exchangeZpub, 23, true);
    expect(isAddressFromWallet(address, exchangeZpub)).toBe(true);
  });

  test('receiving address from wallet', async () => {
    const address = generateAddress(exchangeZpub, 23, false);
    expect(isAddressFromWallet(address, exchangeZpub)).toBe(true);
  });

});
