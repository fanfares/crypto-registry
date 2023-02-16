import { isValidZpub } from './is-valid-zpub';
import { exchangeMnemonic } from './exchange-mnemonic';
import { Bip84Account } from './bip84-account';
import { Network } from '@bcr/types';

describe('is-valid-zpub', function() {
  test('valid', () => {
    const validZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
    expect(isValidZpub(validZpub)).toBe(true);
  });

  test('invalid', () => {
    expect(isValidZpub('any string')).toBe(false);
  });
});
