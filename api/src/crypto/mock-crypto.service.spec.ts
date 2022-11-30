import { MockCryptoService } from './mock-crypto.service';
import { ApiConfigService } from '../api-config/api-config.service';

describe('mock-crypto-service', () => {
  const apiConfig = {
    registrationCost: 10,
    registryKey: 'crypto-registry'
  } as ApiConfigService;

  const service = new MockCryptoService(apiConfig);

  test('get balance', async () => {
    expect(await service.getBalance('exchange-1')).toBe(100);
    expect(await service.getBalance('exchange-2')).toBe(200);
    expect(await service.getBalance('crypto-registry')).toBe(50);
  });

  test('get transaction', async () => {
    expect(await service.getTransaction('exchange-1', 'crypto-registry')).toBe(
      10,
    );
  });

  test('payment is made', async () => {
    expect(await service.isPaymentMade('exchange-1')).toBe(true);
  });

  test('payment is not made', async () => {
    expect(await service.isPaymentMade('exchange-2')).toBe(false);
  });
});
