import { Network } from '@bcr/types';
import { Bip84Utils, exchangeMnemonic } from '../crypto';
import { TestNode } from '../testing';

describe('bitcoin-controller', () => {
  let node: TestNode;
  const exchangeZpub = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');

  beforeEach(async () => {
    node = await TestNode.createTestNode(1, {
      resetMockWallet: true,
      useRealBitcoinService: true
    });
  });

  afterAll(async () => {
    await node.destroy();
  })

  test('get balance', async () => {
    const balance = await node.bitcoinController.getWalletBalance(exchangeZpub, Network.testnet);
    expect(balance).toBe(778000);
  });

  test('get txs for address', async () => {
    const address = node.bitcoinService.getAddress(exchangeZpub, 0, false);
    const txs = await node.bitcoinController.getTransactionsForAddress(address, Network.testnet);
    expect(txs.length).toBe(2);
    expect(txs[0].outputs[0].address).toBe(address);
  });
});
