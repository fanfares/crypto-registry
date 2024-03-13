import { Bip84Utils, exchangeMnemonic, registryMnemonic } from '../crypto';
import { TestNode } from '../testing';
import { Network } from '@bcr/types';

describe('mock-bitcoin-service', () => {
  let node: TestNode;
  const exchangeZpub = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');

  beforeAll(async () => {
    node = await TestNode.createTestNode(1, {
      resetMockWallet: true
    });
  });

  beforeEach(async () => {
    await node.reset();
  });

  afterAll(async () => {
    await node.destroy();
  });

  test('default wallet balance', async () => {
    expect(await node.bitcoinService.getWalletBalance(exchangeZpub)).toBe(0);
  });

  test('send funds', async () => {
    const exchangeUtils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'vprv');
    const receiverAddress = exchangeUtils.getAddress(0, false);
    await node.walletService.sendFunds(receiverAddress, 3000000);
    const toAddressBalance = await node.bitcoinService.getAddressBalance(receiverAddress);
    expect(toAddressBalance).toBe(3000000);
  });
});
