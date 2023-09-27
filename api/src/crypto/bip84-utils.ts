import bip84 from 'bip84';
import { Network } from '@bcr/types';
import * as bip32 from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Interface } from 'bip32/types/bip32';

export interface AddressGenerator {
  getAddress(index: number, change: boolean): string;
}

export class Bip84Utils implements AddressGenerator {
  private readonly rootNode: BIP32Interface;
  private readonly bitcoinNetwork: bitcoin.Network;
  readonly network: Network

  constructor(public zpub: string) {
    const account = new bip84.fromZPub(zpub);
    this.bitcoinNetwork = account.network;
    this.network = account.isTestnet ? Network.testnet : Network.mainnet;
    this.rootNode = bip32.BIP32Factory(ecc).fromBase58(account.zpub, this.bitcoinNetwork);
  }

  static fromMnemonic(mnemonic: string, network = Network.testnet) {
    return new Bip84Utils(Bip84Utils.zpubFromMnemonic(mnemonic, network));
  }

  static zpubFromMnemonic(mnemonic: string, network = Network.testnet): string {
    // noinspection JSPotentiallyInvalidConstructorUsage
    const root = new bip84.fromMnemonic(mnemonic, network === Network.testnet ? 'password' : '', network === Network.testnet);
    const child0 = root.deriveAccount(0);
    const account0 = new bip84.fromZPrv(child0);
    return account0.getAccountPublicKey();
  }

  getAddress(index: number, change: boolean): string {
    try {
      const publicKey = this.rootNode.derive(change ? 1 : 0).derive(index).publicKey;
      const {address} = bitcoin.payments.p2wpkh({
        pubkey: publicKey,
        network: this.bitcoinNetwork
      });
      return address;
    } catch (err) {
      throw new Error(`Bip84Account: getAddress( ${index}, ${change}) on ${this.zpub}`);
    }
  }
}
