import { isValidExtendedKey } from './is-valid-extended-key';
import { exchangeMnemonic } from './exchange-mnemonic';
import { Bip84Utils } from './bip84-utils';
import { Network } from '@bcr/types';

describe('is-valid-zpub', function () {
  test('valid zpub', () => {
    const validZpub = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');
    expect(isValidExtendedKey(validZpub)).toStrictEqual({
      valid: true,
      network: Network.testnet,
      isPrivate: false
    });
  });

  test('valid zprv', () => {
    const validZpub = Bip84Utils.extendedPrivateKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vprv');
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
