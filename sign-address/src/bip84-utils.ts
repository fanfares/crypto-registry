import { Network } from './types';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Interface } from 'bip32/types/bip32';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoinMessage from 'bitcoinjs-message';
import {
  BIP32NetworkDescription,
  getBip32NetworkForKey,
  getBip32NetworkForPrefix,
  getNetworkFromKey, getNetworkFromPrefix, getPathForKey,
  getPathForPrefix,
  NetworkPrefix
} from './bip32-utils';

export interface SignedAddress {
  message: string;
  address: string;
  signature: string;
}

export class Bip84Utils {

  readonly isPrivateKey: boolean;

  protected constructor(
    protected root: BIP32Interface,
    public network: Network,
    public networkBytes: BIP32NetworkDescription,
  ) {
    this.isPrivateKey = !root.isNeutered();
  }

  static getNetworkForExtendedKey(key: string): Network {
    return getNetworkFromKey(key);
  }

  static getNetworkForAddress(address: string) {
    const type = address.substring(0, 3);
    if (type === 'tb1') {
      return Network.testnet;
    } else if (type === 'bc1') {
      return Network.mainnet;
    } else {
      throw new Error('Unsupported address type');
    }
  }

  private static getAccountFromMnemonic(mnemonic: string, network: Network, keyPrefix: NetworkPrefix, password?: string) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password);
    const bip32Network = getBip32NetworkForPrefix(keyPrefix);
    const root = BIP32Factory(ecc).fromSeed(seed, bip32Network);
    const checkNetwork = getNetworkFromPrefix(keyPrefix)
    if ( checkNetwork !== network ) {
      throw new Error('Invalid network prefix combination')
    }
    const path = getPathForPrefix(keyPrefix);
    return root.derivePath(path);
  }

  static fromMnemonic(mnemonic: string, network: Network, prefix: NetworkPrefix, password?: string): Bip84Utils {
    const child = this.getAccountFromMnemonic(mnemonic, network, prefix, password);
    const networkBytes = getBip32NetworkForPrefix(prefix);
    return new Bip84Utils(child, network, networkBytes);
  }

  static fromExtendedKey(key: string): Bip84Utils {
    const network = getNetworkFromKey(key);
    const bip32Network = getBip32NetworkForKey(key);
    const child = BIP32Factory(ecc).fromBase58(key, bip32Network);
    return new Bip84Utils(child, network, bip32Network);
  }

  static extendedPublicKeyFromMnemonic(mnemonic: string, network: Network, prefix: NetworkPrefix, password?: string): string {
    if ( !prefix.endsWith('pub')) throw new Error('Invalid prefix for public key');
    const child = this.getAccountFromMnemonic(mnemonic, network, prefix, password);
    return child.neutered().toBase58();
  }

  static extendedPrivateKeyFromMnemonic(mnemonic: string, network: Network, prefix: NetworkPrefix, password?: string): string {
    if ( !prefix.endsWith('prv')) throw new Error('Invalid prefix for private key');
    const child = this.getAccountFromMnemonic(mnemonic, network, prefix, password);
    return child.toBase58();
  }

  get zpub(): string {
    return this.root.neutered().toBase58();
  }

  static getDerivationPath(privateKey: string, index: number, change: boolean): string {
    return `${getPathForKey(privateKey)}/${change ? '1' : '0'}/${index}`;
  }

  findAddress(address: string) {
    let index: number = -1;
    let change: boolean;
    let i: number = 0;
    while (index === -1) {
      const normalAddress = this.getAddress(i, false);
      if (normalAddress === address) {
        index = i;
        change = false;
      }
      const changeAddress = this.getAddress(i, true);
      if (changeAddress === address) {
        index = i;
        change = true;
      }
      i++;
      if (i > 1000) {
        throw new Error('Cannot find address');
      }
    }
    return {index, change};
  }

  getAddress(index: number, change: boolean): string {
    const child = this.root.derive(change ? 1 : 0).derive(index);
    const {address} = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: this.networkBytes
    });
    return address;
  }

  sign(index: number, change: boolean, message: string): SignedAddress {
    if (this.root.isNeutered()) {
      throw new Error('Cannot sign with a public key');
    }
    const child = this.root.derive(change ? 1 : 0).derive(index);
    const {address} = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: this.networkBytes
    });
    const signature = bitcoinMessage.sign(message, child.privateKey, true);
    return {
      signature: signature.toString('base64'),
      address: address,
      message: message
    };
  }

  static verify(signedAddress: SignedAddress): boolean {
    return bitcoinMessage.verify(signedAddress.message, signedAddress.address, signedAddress.signature, null, true);
  }
}
