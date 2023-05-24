import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import { mnemonicToSeedSync } from 'bip39';

const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

export const getWifFromMnemonic = (mnemonic: string, password: string, network: bitcoin.Network) => {
  const seed = mnemonicToSeedSync(mnemonic, password);
  const node = bip32.fromSeed(seed, bitcoin.networks.testnet);
  const privateKey = node.privateKey;
  const keyPair = ECPair.fromPrivateKey(privateKey, {network: network});
  return keyPair.toWIF();
}
