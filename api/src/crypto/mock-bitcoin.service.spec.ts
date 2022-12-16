import { TestingModule } from '@nestjs/testing/testing-module';
import { createTestDataFromModule, createTestModule } from '../testing';
import { exchangeMnemonic, registryMnemonic } from './test-wallet-mnemonic';
import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';
import { BitcoinService } from './bitcoin.service';
import { MockAddressDbService } from './mock-address-db.service';
import { WalletService } from './wallet.service';

describe('mock-bitcoin-service', () => {
  let module: TestingModule;
  let walletService: WalletService;
  let bitcoinService: BitcoinService;
  let addressDbService: MockAddressDbService;
  const exchangeZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', 'testnet');
  const registryZpub = getZpubFromMnemonic(registryMnemonic, 'password', 'testnet');

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    walletService = module.get<WalletService>(WalletService);
    bitcoinService = module.get<BitcoinService>(BitcoinService);
    addressDbService = module.get<MockAddressDbService>(MockAddressDbService);
  });

  afterEach(async () => {
    await module.close();
  });

  test('receiver address', async () => {
    expect(await addressDbService.count({ zpub: registryZpub })).toBe(0);
    const receiverAddress = await walletService.getReceivingAddress(registryZpub, 'registry');
    expect(await addressDbService.count({ zpub: registryZpub })).toBe(1);
    const address = await addressDbService.findOne({
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

  test('insufficient funds', async () => {
    const receiverAddress = await walletService.getReceivingAddress(exchangeZpub, 'exchange');
    await expect(
      walletService.sendFunds(registryZpub, receiverAddress, 1000)
    ).rejects.toThrow();
  });
});
