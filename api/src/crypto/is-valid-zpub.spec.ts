import { isValidZpub } from './is-valid-zpub';
import { exchangeMnemonic } from './exchange-mnemonic';
import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { Network } from '@bcr/types';

describe('is-valid-zpub', function() {
  test('valid', () => {
    const validZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', Network.testnet);
    expect(isValidZpub(validZpub)).toBe(true);
  });

  test('invalid', () => {
    expect(isValidZpub('any string')).toBe(false);
  });
});
