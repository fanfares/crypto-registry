import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory from 'bip32';
import { mnemonicToSeedSync } from 'bip39';
import HDKey from 'hdkey';
import { faucetMnemonic } from './exchange-mnemonic';

const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

// Equivalent bip39 seed (128 chars, 64 bytes)
const testSeed = '0c541d70e9e00cfdcdeb1d4b5b76df048b30d2535e774e94656444d197582c76b11ca760318ca722d8aca5c03d1f496262491b51fe902209d45c59d498f07129';

// Equivalent Wif
const testWif = 'Kzr2o69bMAeDfrS99215gv9PCD5autUpz7cnsEVctpj1bLKaakJQ';

describe('bitcoinjs-lib', () => {

  const seed = mnemonicToSeedSync(faucetMnemonic);
  const keyPair = bip32.fromSeed(Buffer.from(testSeed, 'hex'));

  it('generate bech32 testnet address', async () => {
    const payment = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.testnet
    });
    expect(payment.address).toEqual('tb1q3x97f4m8jc37exu6v00hsj80xfqes4fl5g5vk4');
  });

  it('generate bech32 mainnet address', () => {
    const {address} = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey
    });
    expect(address).toEqual('bc1q3x97f4m8jc37exu6v00hsj80xfqes4fl7w0ldx');
  });

  it('generates child nodes from extended public Key (hdkey)', () => {
    const keyPairRoot = HDKey.fromMasterSeed(seed);
    const hardenedChild = keyPairRoot.derive(`m/84'/0'/0'/0/0`);
    const extendedPublicKey = hardenedChild.publicExtendedKey;
    const childKey = HDKey.fromExtendedKey(extendedPublicKey);

    const results = [
      'tb1q0sc8hk9zpq77d3amg6pl0zd79v8mmq3fmvj254',
      'tb1qhkpu4e5pyy438hlfah0gq3gm22hgzr7lak6hwx',
      'tb1qgm6kecfy2jtdxfq2cerap3ps2ncxy5tvkvxkc0',
      'tb1qcmn9xsmp7c96582kd9as0yxh7fe4t9g2f5stqg'
    ];

    for (let i = 0; i < 4; i++) {
      const child = childKey.derive(`m/0/${i}`);
      const {address} = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: bitcoin.networks.testnet
      });
      expect(address).toEqual(results[i]);
    }
  });

  it('generate root key in various ways', async () => {
    const privateKey = '6c32703544ae4f135a16b5e436da2e4c2e2d86995d802a1d3e2ea559a07789df';
    const keyPair1 = HDKey.fromMasterSeed(seed);
    const keyPair2 = ECPair.fromWIF(testWif);
    const keyPair3 = bip32.fromSeed(Buffer.from(testSeed, 'hex'));
    expect(keyPair1.privateKey.toString('hex')).toEqual(privateKey);
    expect(keyPair2.privateKey.toString('hex')).toEqual(privateKey);
    expect(keyPair3.privateKey.toString('hex')).toEqual(privateKey);
  });


});
