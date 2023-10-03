import { exchangeMnemonic, registryMnemonic } from './exchange-mnemonic';
import { Bip84Utils } from './bip84-utils';
import { isAddressFromWallet } from './is-address-from-wallet';
import { format } from 'date-fns';
import { getHash } from '../utils';
import { TestNode } from '../testing';
import { Network } from '@bcr/types';

describe('mock-bitcoin-service', () => {
  let node: TestNode;
  const exchangeZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic, Network.testnet);
  const registryZpub = Bip84Utils.zpubFromMnemonic(registryMnemonic, Network.testnet, 'password');

  beforeAll(async () => {
    node = await TestNode.createTestNode(1);
  });

  beforeEach(async () => {
    await node.reset()
  })

  afterAll(async () => {
    await node.destroy();
  });

  test('receiver address', async () => {
    expect(await node.db.mockAddresses.count({zpub: registryZpub})).toBe(0);
    const receiverAddress = await node.walletService.getReceivingAddress(registryZpub);
    expect(await node.db.mockAddresses.count({zpub: registryZpub})).toBe(1);
    const address = await node.db.mockAddresses.findOne({
      address: receiverAddress.address
    });
    expect(address.zpub).toBe(registryZpub);
    expect(address.balance).toBe(0);
    expect(address.unspent).toBe(true);
  });

  test('check wallet balances', async () => {
    expect(await node.bitcoinService.getWalletBalance(registryZpub)).toBe(0);
    expect(await node.bitcoinService.getWalletBalance(exchangeZpub)).toBe(30000000);
  });

  test('send funds', async () => {
    const receiverAddress = await node.walletService.getReceivingAddress(registryZpub);
    await node.walletService.sendFunds(exchangeZpub, receiverAddress.address, 1000);
    await node.walletService.sendFunds(exchangeZpub, receiverAddress.address, 1000);

    const fromBalance = await node.bitcoinService.getWalletBalance(exchangeZpub);
    expect(fromBalance).toBe(30000000 - 2000);

    const toAddressBalance = await node.bitcoinService.getAddressBalance(receiverAddress.address);
    expect(toAddressBalance).toBe(2000);

    const registryWalletBalance = await node.bitcoinService.getWalletBalance(registryZpub);
    expect(registryWalletBalance).toBe(2000);
  });

  test('tx is created', async () => {
    const receiverAddress = await node.walletService.getReceivingAddress(registryZpub);
    const originalWalletBalance = await node.bitcoinService.getWalletBalance(exchangeZpub)
    await node.walletService.sendFunds(exchangeZpub, receiverAddress.address, 1000);
    const txs = await node.bitcoinService.getTransactionsForAddress(receiverAddress.address);
    expect(txs.length).toBe(1);
    const tx = txs[0];
    tx.inputs.forEach(input => {
      expect(isAddressFromWallet(node.bitcoinService, input.address, exchangeZpub)).toBe(true);
    });
    const totalInputValue = tx.inputs.reduce((t, tx) => t + tx.value, 0);
    expect(totalInputValue).toBe(originalWalletBalance);
    const receiverOutput = tx.outputs.find(o => o.address === receiverAddress.address);
    expect(receiverOutput.value).toBe(1000);
    const changeOutput = tx.outputs.find(o => o.address !== receiverAddress.address);
    expect(changeOutput.value).toBe(originalWalletBalance - 1000)
  });

  test('insufficient funds', async () => {
    const receiverAddress = await node.walletService.getReceivingAddress(exchangeZpub);
    await expect(
      node.walletService.sendFunds(registryZpub, receiverAddress.address, 1000)
    ).rejects.toThrow();
  });

  test('create mock blockhash', () => {

    const real = '000000000000000560960ad096fb8babbf790e6428b637fa121f0224189fcaef';

    const dateTime = format(new Date(), 'yyyy-MM-dd:HHmm');
    const hash = getHash(dateTime, 'sha256')
    expect(hash.length).toBe(real.length)

    // const fake = '59ae714e6670460d99e4787678539087fcec09f2440aca4b77eea63c23f64c8b';


  })
});
