import {
  exchangeMnemonic,
  exchangeTpub,
  exchangeTrpv,
  exchangeUpub,
  exchangeUrpv,
  exchangeVpub,
  exchangeVrpv,
  oldTestnetExchangeZprv,
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

  test('vprv from mnemonic', () => {
    const zprvFromMm = Bip84Utils.extendedPrivateKeyFromMnemonic(registryMnemonic, Network.testnet, 'vprv');
    expect(zprvFromMm).toBe('vprv9LXv9MwCDcizxhBfiT6DzpDZW8Cu93VY9oushe7SpXMJPpP7HKKqu6sK7xD8oapp7KsrJdaMMceo8PoLLJfmm1ZPM24JNVcAkiDXP4HdLX1');
  });

  test('zpub from mnemonic', () => {
    const zpubFromMm = Bip84Utils.extendedPublicKeyFromMnemonic(registryMnemonic, Network.testnet, 'vpub');
    expect(zpubFromMm).toBe('vpub5ZXGYsU63zHJBBG8pUdEMxAJ4A3PYWDPX2qUW2X4NrtHGciFpre6SuBnyCk5vSWBUW38r88gaB5wDWNx1EFMS12VZbEXMw7iLKRofjWXQ1u');
  });

  test('address from mnemonic', () => {
    const addressFromMm = Bip84Utils.fromMnemonic(registryMnemonic, Network.testnet, 'vpub');
    expect(addressFromMm.getAddress(0, false)).toBe('tb1qsr5zxt8dhqa88z38e7gpknf9z3cfh50ydpky72');
  });

  test('exchange mnemonic in native segwit', () => {
    const extendedPrivateKey = Bip84Utils.extendedPrivateKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vprv');
    expect(extendedPrivateKey).toBe(exchangeVrpv);

    const extendedPublicKey = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');
    expect(extendedPublicKey).toBe(exchangeVpub);

    const utils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'vprv');
    expect(utils.getAddress(0, false)).toBe('tb1q5896un87k7lgeum9cs5z4p8j42lngydm0we529');

    const {index, change} = utils.findAddress('tb1q5896un87k7lgeum9cs5z4p8j42lngydm0we529');
    expect(index).toBe(0);
    expect(change).toBe(false);

    const signature = utils.sign(0, false, 'I assert that, as of 25 Jan 2024, the exchange owns the referenced bitcoin on behalf of the customers specified');
    expect(signature.address).toBe('tb1q5896un87k7lgeum9cs5z4p8j42lngydm0we529');
    expect(signature.signature).toBe('H1k4n/o0Yp6LMuW16J7WEEyVlDN4mgxdRquZnF11CoTmDbrYX0iedGG4/zRiAJ9JJ7qgeVnDTS6+4STj6j9Iwpk=');
  });

  test('exchange mnemonic in legacy', () => {
    const extendedPrivateKey = Bip84Utils.extendedPrivateKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'tprv');
    expect(extendedPrivateKey).toBe(exchangeTrpv);

    const extendedPublicKey = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'tpub');
    expect(extendedPublicKey).toBe(exchangeTpub);

    const utils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'tprv');
    expect(utils.getAddress(0, false)).toBe('my9FapANVaFVbPu5cXcvF18XsstejzARre');

    const {index, change} = utils.findAddress('my9FapANVaFVbPu5cXcvF18XsstejzARre');
    expect(index).toBe(0);
    expect(change).toBe(false);

    const signature = utils.sign(0, false, 'Hello World');
    expect(signature.address).toBe('my9FapANVaFVbPu5cXcvF18XsstejzARre');
    expect(signature.signature).toBe('IEUNWyJ4+YEVfKQXanMvlphgnCBi7EBXZXpetRsqcMRHem/whM1rCDNZ7KuaqTQqxO76iQDhWV5EblEY6KlTEXE=');
  });

  test('exchange mnemonic in p2sh-segwit', () => {
    const extendedPrivateKey = Bip84Utils.extendedPrivateKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'uprv');
    expect(extendedPrivateKey).toBe(exchangeUrpv);

    const extendedPublicKey = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'upub');
    expect(extendedPublicKey).toBe(exchangeUpub);

    const utils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'uprv');
    expect(utils.getAddress(0, false)).toBe('2NGAiL8GAMx3U6SCaCHujhoPQaX3TSeM2QP');

    const {index, change} = utils.findAddress('2NGAiL8GAMx3U6SCaCHujhoPQaX3TSeM2QP');
    expect(index).toBe(0);
    expect(change).toBe(false);

    const signature = utils.sign(0, false, 'Hello World');
    expect(signature.address).toBe('2NGAiL8GAMx3U6SCaCHujhoPQaX3TSeM2QP');
    expect(signature.signature).toBe('H9jQ/l9yfWrUXXwVGVTfhVHQpMOrcdAhkQrVtpCAb0R3XM+PcP/pb0s8/BuwqX0HYJRQyT+KQEXxItknv2f1WKI=');

    expect(Bip84Utils.verify({
      address: '2NGAiL8GAMx3U6SCaCHujhoPQaX3TSeM2QP',
      message: 'Hello World',
      signature: 'H9jQ/l9yfWrUXXwVGVTfhVHQpMOrcdAhkQrVtpCAb0R3XM+PcP/pb0s8/BuwqX0HYJRQyT+KQEXxItknv2f1WKI='
    })).toBe(true);

    const electrumSignatureVerification = Bip84Utils.verify({
      address: '2NGAiL8GAMx3U6SCaCHujhoPQaX3TSeM2QP',
      message: 'Hello World',
      signature: 'IGs4JTCsK8zwtfEI0xnC70HZ8JsAtfosnAL53Y6WAQPmSHKr6ZrGFq6BwlkgpJ54xwknvqgFiEGAR50eapCBbuQ='
    });
    expect(electrumSignatureVerification).toBe(true);
  });

  test('address from mnemonic with password', () => {
    const addressFromMm = Bip84Utils.fromMnemonic(registryMnemonic, Network.testnet, 'vpub', 'password');
    expect(addressFromMm.getAddress(0, false)).toBe('tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u');
  });

  test('address from zprv', () => {
    // const zprv = 'vprv9LXv9MwCDcizxhBfiT6DzpDZW8Cu93VY9oushe7SpXMJPpP7HKKqu6sK7xD8oapp7KsrJdaMMceo8PoLLJfmm1ZPM24JNVcAkiDXP4HdLX1';
    const addressFromZprv = Bip84Utils.fromExtendedKey(oldTestnetExchangeZprv);
    expect(addressFromZprv.getAddress(0, false)).toBe('tb1q7yx7zmzu9c5s0d6s4ccsagt8r53u8kyrjsgncv');
  });

  test('zpub from mnemonic with password', () => {
    const zpubWithPasswordFromMm = Bip84Utils.extendedPublicKeyFromMnemonic(registryMnemonic, Network.testnet, 'vpub', 'password');
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
    const bip84Utils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'vpub', 'password');
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

  test('sign with a vprv', () => {
    const message = 'hello world';
    const bip84Utils = Bip84Utils.fromExtendedKey(oldTestnetExchangeZprv);
    const signature = bip84Utils.sign(0, false, message);
    expect(signature.address).toBe('tb1q7yx7zmzu9c5s0d6s4ccsagt8r53u8kyrjsgncv');
  });

  test('cannot sign with public key', () => {
    const bip84Utils = Bip84Utils.fromExtendedKey(testnetRegistryZpub);
    expect(() => bip84Utils.sign(0, false, signingMessage)).toThrow('Cannot sign with a public key');
  });

  test('zprv', () => {
    const depositsRegistryMnemonic = 'depend unhappy height monitor poet ceiling athlete drink loyal quality decade among';
    const utils = Bip84Utils.fromMnemonic(depositsRegistryMnemonic, Network.mainnet, 'zprv');
    console.log(utils.getAddress(0, false));

    const zpub = Bip84Utils.extendedPublicKeyFromMnemonic(depositsRegistryMnemonic, Network.mainnet, 'zpub');
    console.log(zpub);

    const zprv = Bip84Utils.extendedPrivateKeyFromMnemonic(depositsRegistryMnemonic, Network.mainnet, 'zprv');
    console.log(zprv);
  });

});
