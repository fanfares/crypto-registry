import {
  exchangeMnemonic,
  oldTestnetExchangeZpub,
  registryMnemonic,
  testnetRegistryZprv,
  testnetRegistryZpub
} from './exchange-mnemonic';
import { Bip84Utils } from './bip84-utils';
import { Network } from '@bcr/types';

describe('bip84 utils', () => {
  const signingMessage = 'hello world';

  const results = [
    'tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u',
    'tb1qurge6erkrqd4l9ca2uvgkgjddz0smrq5nhg72u',
    'tb1q7n9ypse0gth6fxu9u4z3u08shu48aqw809a85r',
    'tb1quvkcnqtw35ye74yu8x6xm3ld3c3dd4xgjt9a9a'
  ];

  test('identify network', () => {
    const bip84 = Bip84Utils.fromExtendedKey(testnetRegistryZpub);
    expect(bip84.network).toBe(Network.testnet);
  });

  test('generate first four addresses', () => {
    const bip84 = Bip84Utils.fromExtendedKey(testnetRegistryZpub);
    for (let i = 0; i < 4; i++) {
      expect(bip84.getAddress(i, false)).toBe(results[i]);
    }
  });

  test('generate first change address for test exchange', () => {
    const bip84 = Bip84Utils.fromExtendedKey(oldTestnetExchangeZpub);
    expect(bip84.getAddress(1, false)).toBe('tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul');
  });

  test('zprv from mnemonic', () => {
    const zprvFromMm = Bip84Utils.zprvFromMnemonic(registryMnemonic, Network.testnet);
    expect(zprvFromMm).toBe('vprv9LXv9MwCDcizxhBfiT6DzpDZW8Cu93VY9oushe7SpXMJPpP7HKKqu6sK7xD8oapp7KsrJdaMMceo8PoLLJfmm1ZPM24JNVcAkiDXP4HdLX1');
  });

  test('zpub from mnemonic', () => {
    const zpubFromMm = Bip84Utils.zpubFromMnemonic(registryMnemonic, Network.testnet);
    expect(zpubFromMm).toBe('vpub5ZXGYsU63zHJBBG8pUdEMxAJ4A3PYWDPX2qUW2X4NrtHGciFpre6SuBnyCk5vSWBUW38r88gaB5wDWNx1EFMS12VZbEXMw7iLKRofjWXQ1u');
  });

  test('address from mnemonic', () => {
    const addressFromMm = Bip84Utils.fromMnemonic(registryMnemonic, Network.testnet);
    expect(addressFromMm.getAddress(0, false)).toBe('tb1qsr5zxt8dhqa88z38e7gpknf9z3cfh50ydpky72');
  });

  test('address from mnemonic with password', () => {
    const addressFromMm = Bip84Utils.fromMnemonic(registryMnemonic, Network.testnet, 'password');
    expect(addressFromMm.getAddress(0, false)).toBe('tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u');
  });

  test('address from zprv', () => {
    const zprv = 'vprv9LXv9MwCDcizxhBfiT6DzpDZW8Cu93VY9oushe7SpXMJPpP7HKKqu6sK7xD8oapp7KsrJdaMMceo8PoLLJfmm1ZPM24JNVcAkiDXP4HdLX1';
    const addressFromZprv = Bip84Utils.fromExtendedKey(zprv);
    expect(addressFromZprv.getAddress(0, false)).toBe('tb1qsr5zxt8dhqa88z38e7gpknf9z3cfh50ydpky72');
  });

  test('zpub from mnemonic with password', () => {
    const zpubWithPasswordFromMm = Bip84Utils.zpubFromMnemonic(registryMnemonic, Network.testnet, 'password');
    expect(zpubWithPasswordFromMm).toBe(testnetRegistryZpub);
  });

  test('address from test registry zprv ', () => {
    const addressFromOldZprv = Bip84Utils.fromExtendedKey(testnetRegistryZprv);
    expect(addressFromOldZprv.getAddress(0, false)).toBe('tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u');
  });

  test('address from zpub', () => {
    const addressFromOldZprv = Bip84Utils.fromExtendedKey(testnetRegistryZpub);
    expect(addressFromOldZprv.getAddress(0, false)).toBe('tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u');
  });

  test('sign and verify', () => {
    const bip84Utils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'password');
    const message = 'hello world';

    const signedAddress1 = bip84Utils.sign(0, false, message);
    let verified = Bip84Utils.verify(signedAddress1);
    expect(verified).toBe(true);

    const signedAddress2 = bip84Utils.sign(2, false, message);
    verified = Bip84Utils.verify(signedAddress2);
    expect(verified).toBe(true);

    signedAddress2.address = signedAddress1.address;
    verified = Bip84Utils.verify(signedAddress2);
    expect(verified).toBe(false);
  });

  test('cannot sign with public key', () => {
    const bip84Utils = Bip84Utils.fromExtendedKey(testnetRegistryZpub);
    expect(() => bip84Utils.sign(0, false, signingMessage)).toThrow('Cannot sign with a public key');
  });
});
