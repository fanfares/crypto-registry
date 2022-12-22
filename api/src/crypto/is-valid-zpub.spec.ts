import { isValidZpub } from './is-valid-zpub';
import { exchangeMnemonic } from './test-wallet-mnemonic';
import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';

describe('is-valid-zpub', function() {
  test('valid', () => {
    const validZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', 'testnet');
    expect(isValidZpub(validZpub)).toBe(true);
  });

  test('invalid', () => {
    expect(isValidZpub('any string')).toBe(false);
  });
});
