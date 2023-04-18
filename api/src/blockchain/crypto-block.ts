import { getHash } from '../utils';

export interface BlockData {
  sender: string,
  recipient: string,
  quantity: number
}

export class CryptoBlock {

  hash: string;
  nonce = 0;

  constructor(
    public index: number,
    public timestamp: string,
    public data: BlockData,
    public precedingHash: string = ' ') {
    this.hash = this.computeHash();
  }

  computeHash() {
    return getHash(this.index + this.precedingHash + this.timestamp + JSON.stringify(this.data) + this.nonce, 'sha256');
  }

  proofOfWork(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.computeHash();
    }
  }
}
