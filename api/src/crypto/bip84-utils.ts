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
  rootNode: BIP32Interface;
  network: bitcoin.Network;

  constructor(public zpub: string) {
    const account = new bip84.fromZPub(zpub);
    this.network = account.network;
    this.rootNode = bip32.BIP32Factory(ecc).fromBase58(account.zpub, this.network);
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
        network: this.network
      });
      return address;
    } catch (err) {
      throw new Error(`Bip84Account: getAddress( ${index}, ${change}) on ${this.zpub}`);
    }
  }
}
