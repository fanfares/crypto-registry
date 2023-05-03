import { exchangeMnemonic, registryMnemonic } from './exchange-mnemonic';
import { Bip84Account } from './bip84-account';
import { isAddressFromWallet } from './is-address-from-wallet';
import { format } from 'date-fns';
import { getHash } from '../utils';
import { TestNode } from '../testing';

describe('mock-bitcoin-service', () => {
  let node: TestNode;
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);

  beforeAll(async () => {
    node = await TestNode.createTestNode(1);
  });

  beforeEach(async () => {
    await node.reset(true)
  })

  afterAll(async () => {
    await node.destroy();
  });

  test('receiver address', async () => {
    expect(await node.db.mockAddresses.count({zpub: registryZpub})).toBe(0);
    const receiverAddress = await node.walletService.getReceivingAddress(registryZpub, 'registry');
    expect(await node.db.mockAddresses.count({zpub: registryZpub})).toBe(1);
    const address = await node.db.mockAddresses.findOne({
      address: receiverAddress
    });
    expect(address.zpub).toBe(registryZpub);
    expect(address.balance).toBe(0);
    expect(address.unspent).toBe(true);
    expect(address.walletName).toBe('registry');
  });

  test('check wallet balances', async () => {
    expect(await node.bitcoinService.getWalletBalance(registryZpub)).toBe(0);
    expect(await node.bitcoinService.getWalletBalance(exchangeZpub)).toBe(30000000);
  });

  test('send funds', async () => {
    const receiverAddress = await node.walletService.getReceivingAddress(registryZpub, 'registry');
    await node.walletService.sendFunds(exchangeZpub, receiverAddress, 1000);
    await node.walletService.sendFunds(exchangeZpub, receiverAddress, 1000);

    const fromBalance = await node.bitcoinService.getWalletBalance(exchangeZpub);
    expect(fromBalance).toBe(30000000 - 2000);

    const toAddressBalance = await node.bitcoinService.getAddressBalance(receiverAddress);
    expect(toAddressBalance).toBe(2000);

    const registryWalletBalance = await node.bitcoinService.getWalletBalance(registryZpub);
    expect(registryWalletBalance).toBe(2000);
  });

  test('tx is created', async () => {
    const receiverAddress = await node.walletService.getReceivingAddress(registryZpub, 'registry');
    const originalWalletBalance = await node.bitcoinService.getWalletBalance(exchangeZpub)
    await node.walletService.sendFunds(exchangeZpub, receiverAddress, 1000);
    const txs = await node.bitcoinService.getTransactionsForAddress(receiverAddress);
    expect(txs.length).toBe(1);
    const tx = txs[0];
    tx.inputs.forEach(input => {
      expect(isAddressFromWallet(input.address, exchangeZpub)).toBe(true);
    });
    const totalInputValue = tx.inputs.reduce((t, tx) => t + tx.value, 0);
    expect(totalInputValue).toBe(originalWalletBalance);
    const receiverOutput = tx.outputs.find(o => o.address === receiverAddress);
    expect(receiverOutput.value).toBe(1000);
    const changeOutput = tx.outputs.find(o => o.address !== receiverAddress);
    expect(changeOutput.value).toBe(originalWalletBalance - 1000)
  });

  test('insufficient funds', async () => {
    const receiverAddress = await node.walletService.getReceivingAddress(exchangeZpub, 'exchange');
    await expect(
      node.walletService.sendFunds(registryZpub, receiverAddress, 1000)
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
