import bip84 from 'bip84';

export class Bip84Account {
  account: any;

  constructor(public zpub: string) {
    this.account = new bip84.fromZPub(zpub);
  }

  static fromMnemonic(mnemonic: string) {
    return new Bip84Account(Bip84Account.zpubFromMnemonic(mnemonic));
  }

  static zpubFromMnemonic(mnemonic: string) {
    // eslint-disable-next-line
    const root = new bip84.fromMnemonic(mnemonic, 'password', true);
    const child0 = root.deriveAccount(0);
    const account0 = new bip84.fromZPrv(child0);
    return account0.getAccountPublicKey();
  }

  getAddress(index: number, change = false): string {
    return this.account.getAddress(index, change)
  }
}
