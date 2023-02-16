import bip84 from 'bip84';

export class Bip84Account {
  account: any;

  constructor(zpub: string) {
    this.account = new bip84.fromZPub(zpub);
  }

  getAddress(index: number, change: boolean) {
    return this.account.getAddress(index, change)
  }
}
