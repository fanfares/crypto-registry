import { TestingModule } from '@nestjs/testing/testing-module';
import { Network } from '@bcr/types';
import { Bip84Account } from './bip84-account';
import { exchangeMnemonic } from './exchange-mnemonic';
import { createTestDataFromModule, createTestModule } from '../testing';
import { CryptoController } from './crypto.controller';
import { generateAddress } from './generate-address';

describe('bitcoin-controller', () => {
  let controller: CryptoController;
  let module: TestingModule;
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  // const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    controller = module.get<CryptoController>(CryptoController);
  });

  test('get balance', async () => {
    const balance = await controller.getWalletBalance(exchangeZpub, Network.testnet);
    expect(balance).toBe(30000000);
  });

  test('get txs for address', async () => {
    const address = generateAddress(exchangeZpub, 0, false);
    const txs = await controller.getTransactionsForAddress(address, Network.testnet);
    expect(txs.length).toBe(1);
    expect(txs[0].outputs[0].address).toBe(address);
  });
});
