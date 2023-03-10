import { CryptoBlock } from './crypto-block';


export class CryptoBlockchain {
  blockchain: any[];

  constructor(public difficulty: number) {
    this.blockchain = [this.startGenesisBlock()];
  }

  startGenesisBlock() {
    return new CryptoBlock(0, '01/01/2020', {
      quantity: 0,
      recipient: 'genesis',
      sender: 'genesis'
    }, '0');
  }

  obtainLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  addNewBlock(newBlock: CryptoBlock) {
    newBlock.precedingHash = this.obtainLatestBlock().hash;
    newBlock.proofOfWork(this.difficulty);
    this.blockchain.push(newBlock);
  }

  checkChainValidity(){
    for(let i = 1; i < this.blockchain.length; i++){
      const currentBlock = this.blockchain[i];
      const precedingBlock= this.blockchain[i-1];

      if(currentBlock.hash !== currentBlock.computeHash()){
        return false;
      }
      if(currentBlock.precedingHash !== precedingBlock.hash)
        return false;
    }
    return true;
  }
}
