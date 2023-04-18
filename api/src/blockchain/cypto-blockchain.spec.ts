import { CryptoBlockchain } from './crypto-blockchain';
import { CryptoBlock } from './crypto-block';

describe('crypto-blockchain', () => {

  test('create chain', () => {
    const blockchain = new CryptoBlockchain(5);
    blockchain.addNewBlock(new CryptoBlock(1, "01/06/2020", {
      sender: "Iris Ljesnjanin",
      recipient: "Cosima Mielke",
      quantity: 50
    }));
    blockchain.addNewBlock(new CryptoBlock(2, "01/07/2020", {
      sender: "Vitaly Friedman",
      recipient: "Ricardo Gimenes",
      quantity: 100
    }));
    expect(blockchain.checkChainValidity()).toBe(true)
    console.log(JSON.stringify(blockchain, null, 2))
  })


})
