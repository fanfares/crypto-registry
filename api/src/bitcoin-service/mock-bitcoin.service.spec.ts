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
    await node.walletService.reset();
  });

  afterAll(async () => {
    await node.destroy();
  });

  test('default wallet balance', async () => {
    expect(await node.bitcoinService.getWalletBalance(exchangeZpub)).toBe(30000000);
  });

  test('send funds', async () => {
    const exchangeUtils = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'vprv');
    const receiverAddress = exchangeUtils.getAddress(0, false);
    await node.walletService.sendFunds(receiverAddress, 1000);
    await node.walletService.sendFunds(receiverAddress, 1000);

    const toAddressBalance = await node.bitcoinService.getAddressBalance(receiverAddress);
    expect(toAddressBalance).toBe(30002000);
  });
});
