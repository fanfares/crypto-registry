import bip84 from 'bip84';
import { Network } from '@bcr/types';

export class Bip84Account {
  account: any;

  constructor(public zpub: string) {
    this.account = new bip84.fromZPub(zpub);
  }

  static fromMnemonic(mnemonic: string, network = Network.testnet) {
    return new Bip84Account(Bip84Account.zpubFromMnemonic(mnemonic, network));
  }

  static zpubFromMnemonic(mnemonic: string, network = Network.testnet) {
    // noinspection JSPotentiallyInvalidConstructorUsage
    const root = new bip84.fromMnemonic(mnemonic, network === Network.testnet ? 'password' : '', network === Network.testnet);
    const child0 = root.deriveAccount(0);
    const account0 = new bip84.fromZPrv(child0);
    return account0.getAccountPublicKey();
  }

  getAddress(index: number, change = false): string {
    try {
      return this.account.getAddress(index, change);
    } catch ( err ) {
      throw new Error(`Bip84Account: getAddress( ${index}, ${change}) on ${this.zpub}`);
    }
  }
}
