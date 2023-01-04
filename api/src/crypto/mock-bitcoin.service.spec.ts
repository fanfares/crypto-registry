import { TestingModule } from '@nestjs/testing/testing-module';
import { createTestDataFromModule, createTestModule } from '../testing';
import { exchangeMnemonic, registryMnemonic } from './test-wallet-mnemonic';
import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { WalletService } from './wallet.service';
import { isAddressFromWallet } from './is-address-from-wallet';
import { DbService } from '../db/db.service';
import { Network } from '@bcr/types';
import { BitcoinServiceFactory } from './bitcoin-service-factory';
import { BitcoinService } from './bitcoin.service';

describe('mock-bitcoin-service', () => {
  let module: TestingModule;
  let walletService: WalletService;
  let bitcoinService: BitcoinService;
  let dbService: DbService;
  const exchangeZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', Network.testnet);
  const registryZpub = getZpubFromMnemonic(registryMnemonic, 'password', Network.testnet);

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    walletService = module.get<WalletService>(WalletService);
    const bitcoinServiceFactory = module.get<BitcoinServiceFactory>(BitcoinServiceFactory);
    bitcoinService = bitcoinServiceFactory.getService(Network.testnet)
    dbService = module.get<DbService>(DbService);
  });

  afterEach(async () => {
    await module.close();
  });

  test('receiver address', async () => {
    expect(await dbService.mockAddresses.count({ zpub: registryZpub })).toBe(0);
    const receiverAddress = await walletService.getReceivingAddress(registryZpub, 'registry');
    expect(await dbService.mockAddresses.count({ zpub: registryZpub })).toBe(1);
    const address = await dbService.mockAddresses.findOne({
      address: receiverAddress
    });
    expect(address.zpub).toBe(registryZpub);
    expect(address.balance).toBe(0);
    expect(address.unspent).toBe(true);
    expect(address.walletName).toBe('registry');
  });

  test('check wallet balances', async () => {
    expect(await bitcoinService.getWalletBalance(registryZpub)).toBe(0);
    expect(await bitcoinService.getWalletBalance(exchangeZpub)).toBe(30000000);
  });

  test('send funds', async () => {
    const receiverAddress = await walletService.getReceivingAddress(registryZpub, 'registry');
    await walletService.sendFunds(exchangeZpub, receiverAddress, 1000);
    await walletService.sendFunds(exchangeZpub, receiverAddress, 1000);

    const fromBalance = await bitcoinService.getWalletBalance(exchangeZpub);
    expect(fromBalance).toBe(30000000 - 2000);

    const toAddressBalance = await bitcoinService.getAddressBalance(receiverAddress);
    expect(toAddressBalance).toBe(2000);

    const registryWalletBalance = await bitcoinService.getWalletBalance(registryZpub);
    expect(registryWalletBalance).toBe(2000);
  });

  test('tx is created', async () => {
    const receiverAddress = await walletService.getReceivingAddress(registryZpub, 'registry');
    const originalWalletBalance = await bitcoinService.getWalletBalance(exchangeZpub)
    await walletService.sendFunds(exchangeZpub, receiverAddress, 1000);
    const txs = await bitcoinService.getTransactionsForAddress(receiverAddress);
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
    const receiverAddress = await walletService.getReceivingAddress(exchangeZpub, 'exchange');
    await expect(
      walletService.sendFunds(registryZpub, receiverAddress, 1000)
    ).rejects.toThrow();
  });
});
