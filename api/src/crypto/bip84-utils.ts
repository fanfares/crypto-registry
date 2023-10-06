import { Network } from '@bcr/types';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Interface } from 'bip32/types/bip32';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoinMessage from 'bitcoinjs-message';

export interface SignedAddress {
  message: string;
  address: string;
  signature: string;
}

const segwitTestnetNetwork = {
  ...bitcoin.networks.testnet,
  bip32: {
    ...bitcoin.networks.testnet.bip32,
    private: 0x045f18bc,
    public: 0x045f1cf6
  }
};

const segwitMainnetNetwork = {
  ...bitcoin.networks.bitcoin,
  bip32: {
    ...bitcoin.networks.bitcoin.bip32,
    private: 0x04b2430c,
    public: 0x04b24746
  }
};

export class Bip84Utils {

  protected constructor(
    protected root: BIP32Interface,
    public network: Network
  ) {
  }

  static getNetwork(key: string): Network {
    const type = key.substring(0, 4)
    switch (type) {
      case 'zpub': return Network.mainnet;
      case 'zprv': return Network.mainnet;
      case 'vpub': return Network.testnet;
      case 'vprv': return Network.testnet;
      default: throw new Error('Unsupported key type');
    }
  }

  private static getAccountFromMnemonic(mnemonic: string, network: Network, password?: string) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password);
    const bitcoinNetwork = network === Network.testnet ? segwitTestnetNetwork : bitcoin.networks.bitcoin;
    const root = BIP32Factory(ecc).fromSeed(seed, bitcoinNetwork);
    const path = network === Network.testnet ? 'm/84\'/1\'/0\'' : 'm/84\'/0\'/0\''
    return root.derivePath(path);
  }

  static fromMnemonic(mnemonic: string, network: Network, password?: string): Bip84Utils {
    const child = this.getAccountFromMnemonic(mnemonic, network, password);
    return new Bip84Utils(child, network);
  }

  static fromExtendedKey(key: string): Bip84Utils {
    const network = this.getNetwork(key);
    const bitcoinNetwork = this.getBitcoinNetwork(network);
    const child = BIP32Factory(ecc).fromBase58(key, bitcoinNetwork);
    return new Bip84Utils(child, network);
  }

  static zpubFromMnemonic(mnemonic: string, network: Network, password?: string): string {
    const child = this.getAccountFromMnemonic(mnemonic, network, password);
    return child.neutered().toBase58();
  }

  static zprvFromMnemonic(mnemonic: string, network: Network, password?: string): string {
    const child = this.getAccountFromMnemonic(mnemonic, network, password);
    return child.toBase58();
  }

  get zpub(): string {
    return this.root.neutered().toBase58();
  }

  getAddress(index: number, change: boolean): string {
    const bitcoinNetwork = Bip84Utils.getBitcoinNetwork(this.network);
    const child = this.root.derive(change ? 1 : 0 ).derive(index);
    const {address} = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: bitcoinNetwork
    });
    return address;
  }

  sign(index: number, message: string): SignedAddress {
    if ( this.root.isNeutered()) {
      throw new Error('Cannot sign with a public key');
    }
    const bitcoinNetwork = Bip84Utils.getBitcoinNetwork(this.network);
    const child = this.root.derive(0).derive(index);
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: bitcoinNetwork
    });
    const signature = bitcoinMessage.sign(message, child.privateKey, false, {segwitType: 'p2wpkh'});
    return {
      signature: signature.toString('base64'),
      address: address,
      message: message
    };
  }

  private static getBitcoinNetwork(network: Network) {
    return network === Network.testnet ? segwitTestnetNetwork : segwitMainnetNetwork;
  }

  static verify(signedAddress: SignedAddress): boolean {
    return bitcoinMessage.verify(signedAddress.message, signedAddress.address, signedAddress.signature);
  }
}
