import { Network } from '@bcr/types';
import { Bip84Account } from './bip84-account';
import { exchangeMnemonic } from './exchange-mnemonic';
import { generateAddress } from './generate-address';
import { TestNode } from '../testing';

describe('bitcoin-controller', () => {
  let node: TestNode;
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  // const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);

  beforeEach(async () => {
    node = await TestNode.createTestNode(1);
  });

  test('get balance', async () => {
    const balance = await node.bitcoinController.getWalletBalance(exchangeZpub, Network.testnet);
    expect(balance).toBe(30000000);
  });

  test('get txs for address', async () => {
    const address = generateAddress(exchangeZpub, 0, false);
    const txs = await node.bitcoinController.getTransactionsForAddress(address, Network.testnet);
    expect(txs.length).toBe(1);
    expect(txs[0].outputs[0].address).toBe(address);
  });
});
