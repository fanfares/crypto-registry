import { Network } from '@bcr/types';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Interface } from 'bip32/types/bip32';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoinMessage from 'bitcoinjs-message';
import {
  BIP32NetworkDescription,
  getBip32NetworkForKey,
  getBip32NetworkForPrefix, getNetworkDefinitionFromKey,
  getNetworkDefinitionFromPrefix,
  getNetworkFromKey, getNetworkFromPrefix,
  getPathForKey,
  getPathForPrefix,
  NetworkPrefix,
  ScriptType
} from './bip32-utils';
import { BadRequestException } from '@nestjs/common';
import { Payment } from 'bitcoinjs-lib/src/payments';

export interface SignedAddress {
  message: string;
  address: string;
  signature: string;
}

export class Bip84Utils {

  readonly isPrivateKey: boolean;

  protected constructor(
    public root: BIP32Interface,
    public network: Network,
    public networkBytes: BIP32NetworkDescription,
    public scriptType: ScriptType
  ) {
    this.isPrivateKey = !root.isNeutered();
  }

  static getNetworkForExtendedKey(key: string): Network {
    return getNetworkFromKey(key);
  }

  static getNetworkForAddress(address: string) {
    const type = address.substring(0, 3);
    if (address.startsWith('tb1') || address.startsWith('2') || address.startsWith('n') || address.startsWith('m')) {
      return Network.testnet;
    } else if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
      return Network.mainnet;
    } else {
      throw new BadRequestException('Unsupported address type');
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
    const account = this.getAccountFromMnemonic(mnemonic, network, prefix, password);
    const networkDefinition = getNetworkDefinitionFromPrefix(prefix);
    const networkBytes = getBip32NetworkForPrefix(prefix);
    return new Bip84Utils(account, networkDefinition.network, networkBytes, networkDefinition.scriptType);
  }

  static fromExtendedKey(key: string): Bip84Utils {
    const network = getNetworkFromKey(key);
    const bip32Network = getBip32NetworkForKey(key);
    const account = BIP32Factory(ecc).fromBase58(key, bip32Network);
    const networkDefinition = getNetworkDefinitionFromKey(key);
    return new Bip84Utils(account, networkDefinition.network, bip32Network, networkDefinition.scriptType);
  }

  static extendedPublicKeyFromMnemonic(mnemonic: string, network: Network, prefix: NetworkPrefix, password?: string): string {
    if (!prefix.endsWith('pub')) throw new Error('Invalid prefix for public key');
    const child = this.getAccountFromMnemonic(mnemonic, network, prefix, password);
    return child.neutered().toBase58();
  }

  static extendedPrivateKeyFromMnemonic(mnemonic: string, network: Network, prefix: NetworkPrefix, password?: string): string {
    if (!prefix.endsWith('prv')) throw new Error('Invalid prefix for private key');
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
        throw new BadRequestException('Cannot find address');
      }
    }
    return {index, change};
  }

  getAddress(index: number, change: boolean): string {
    const child = this.root.derive(change ? 1 : 0).derive(index);
    let payment: Payment = {
      pubkey: child.publicKey,
      network: this.networkBytes
    }
    switch (this.scriptType ) {
      case 'p2wpkh':
        payment = bitcoin.payments.p2wpkh(payment);
        break;
      case 'p2pkh':
        payment = bitcoin.payments.p2pkh(payment);
        break;
      case 'p2wpkh-p2sh':
        payment = bitcoin.payments.p2wpkh(payment);
        payment = bitcoin.payments.p2sh({
          redeem: payment,
          network: this.networkBytes
        });
        break;
      default:
        throw new Error('Unsupported Script Type')
    }
    return payment.address;
  }

  sign(index: number, change: boolean, message: string): SignedAddress {
    if (this.root.isNeutered()) {
      throw new Error('Cannot sign with a public key');
    }
    const address = this.getAddress(index, change);
    const child = this.root.derive(change ? 1 : 0).derive(index);
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
