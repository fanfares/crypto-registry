import { sendBitcoinToMockAddress } from './send-bitcoin-to-mock-address';
import { TestingModule } from '@nestjs/testing/testing-module';
import { createTestDataFromModule } from '../testing/create-test-data-from-module';
import { createTestModule } from '../testing/create-test-module';
import { BitcoinService } from './bitcoin.service';
import { MongoService } from '../db/mongo.service';

describe('mock-bitcoin-service', () => {
  let module: TestingModule;
  let service: BitcoinService;
  let mongoService: MongoService;
  const exchangeAddress1 = 'exchange-address-1';
  const registryAddress1 = 'registry-address-1';

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    service = module.get<BitcoinService>(BitcoinService);
    mongoService = module.get<MongoService>(MongoService);
  });

  afterEach(async () => {
    await module.close();
  });

  test('get balance', async () => {
    expect(await service.getBalance('registry-address-1')).toBe(0);
    expect(await service.getBalance('exchange-address-1')).toBe(1000);
    expect(await service.getBalance('unknown')).toBe(0);
  });

  test('send to existing address', async () => {
    await sendBitcoinToMockAddress(mongoService, exchangeAddress1, registryAddress1, 10);
    await sendBitcoinToMockAddress(mongoService, exchangeAddress1, registryAddress1, 10);
    const fromBalance = await service.getBalance(exchangeAddress1);
    const toBalance = await service.getBalance(registryAddress1);
    expect(fromBalance).toBe(980);
    expect(toBalance).toBe(20);
  });

  test('send to new address', async () => {
    await sendBitcoinToMockAddress(mongoService, exchangeAddress1, 'any', 10);
    const fromBalance = await service.getBalance(exchangeAddress1);
    const toBalance = await service.getBalance('any');
    expect(fromBalance).toBe(990);
    expect(toBalance).toBe(10);
  });

  test('insufficient funds from existing account', async () => {
    await expect(
      sendBitcoinToMockAddress(mongoService, registryAddress1, 'any', 1000)
    ).rejects.toThrow();
  });

  test('insufficient funds from new account', async () => {
    await expect(
      sendBitcoinToMockAddress(mongoService, 'any', registryAddress1, 1000)
    ).rejects.toThrow();
  });
});
