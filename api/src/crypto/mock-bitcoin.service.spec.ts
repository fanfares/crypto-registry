import { TestingModule } from '@nestjs/testing/testing-module';
import { createTestDataFromModule, createTestModule } from '../testing';
import { BitcoinService } from './bitcoin.service';
import { MockBitcoinService } from './mock-bitcoin.service';

describe('mock-bitcoin-service', () => {
  let module: TestingModule;
  let service: MockBitcoinService;
  const exchangeAddress1 = 'exchange-address-1';
  const registryAddress1 = 'registry-address-1';

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    service = module.get<BitcoinService>(BitcoinService) as any as MockBitcoinService;
  });

  afterEach(async () => {
    await module.close();
  });

  test('get balance', async () => {
    expect(await service.getBalance('registry-address-1')).toBe(0);
    expect(await service.getBalance('exchange-address-1')).toBe(3000);
    expect(await service.getBalance('unknown')).toBe(0);
  });

  test('send to existing address', async () => {
    await service.sendFunds( exchangeAddress1, registryAddress1, 10);
    await service.sendFunds( exchangeAddress1, registryAddress1, 10);
    const fromBalance = await service.getBalance(exchangeAddress1);
    const toBalance = await service.getBalance(registryAddress1);
    expect(fromBalance).toBe(2980);
    expect(toBalance).toBe(20);
  });

  test('send to new address', async () => {
    await service.sendFunds( exchangeAddress1, 'any', 10);
    const fromBalance = await service.getBalance(exchangeAddress1);
    const toBalance = await service.getBalance('any');
    expect(fromBalance).toBe(2990);
    expect(toBalance).toBe(10);
  });

  test('insufficient funds from existing account', async () => {
    await expect(
      service.sendFunds( registryAddress1, 'any', 1000)
    ).rejects.toThrow();
  });

  test('insufficient funds from new account', async () => {
    await expect(
      service.sendFunds( 'any', registryAddress1, 1000)
    ).rejects.toThrow();
  });
});
