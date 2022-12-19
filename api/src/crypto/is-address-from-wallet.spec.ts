import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { exchangeMnemonic } from './test-wallet-mnemonic';
import { generateAddress } from './generate-address';
import { isAddressFromWallet } from './is-address-from-wallet';

describe('is-address-in-wallet', () => {
  const exchangeZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', 'testnet');

  test('change address from wallet', async () => {
    const address = generateAddress(exchangeZpub, 23, true);
    expect(isAddressFromWallet(address, exchangeZpub)).toBe(true);
  });

  test('receiving address from wallet', async () => {
    const address = generateAddress(exchangeZpub, 23, false);
    expect(isAddressFromWallet(address, exchangeZpub)).toBe(true);
  });

});
