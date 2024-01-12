import { isValidExtendedKey } from './is-valid-extended-key';
import { exchangeMnemonic } from './exchange-mnemonic';
import { Bip84Utils } from './bip84-utils';
import { Network } from '@bcr/types';

describe('is-valid-zpub', function () {
  test('valid zpub', () => {
    const validZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic, Network.testnet);
    expect(isValidExtendedKey(validZpub)).toStrictEqual({
      valid: true,
      network: Network.testnet,
      isPrivate: false
    });
  });

  test('valid zprv', () => {
    const validZpub = Bip84Utils.zprvFromMnemonic(exchangeMnemonic, Network.testnet);
    expect(isValidExtendedKey(validZpub)).toStrictEqual({
      valid: true,
      network: Network.testnet,
      isPrivate: true
    });
  });

  test('invalid', () => {
    expect(isValidExtendedKey('any string')).toStrictEqual({
      valid: false
    });
  });
});
