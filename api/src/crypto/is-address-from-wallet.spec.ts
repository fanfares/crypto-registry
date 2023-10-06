import { Bip84Utils } from './bip84-utils';
import { exchangeMnemonic } from './exchange-mnemonic';
import { isAddressFromWallet } from './is-address-from-wallet';
import { Network } from '@bcr/types';

describe('is-address-in-wallet', () => {
  const exchangeZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic, Network.testnet);

  test('change address from wallet', async () => {
    const address = Bip84Utils.fromExtendedKey(exchangeZpub).getAddress(23, true);
    expect(isAddressFromWallet(address, exchangeZpub)).toBe(true);
  });

  test('receiving address from wallet', async () => {
    const address = Bip84Utils.fromExtendedKey(exchangeZpub).getAddress(23, true);
    expect(isAddressFromWallet(address, exchangeZpub)).toBe(true);
  });

});
