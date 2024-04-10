import { DbService } from '../db/db.service';
import { MongoService } from '../db';
import { ApiConfigService } from '../api-config';
import { exchangeVpub } from '../crypto';
import { MockWalletService } from './mock-wallet.service';
import { MockBitcoinService } from './mock-bitcoin.service';

describe('mock-wallet-service', () => {
  let dbService: DbService;
  let apiConfigService: ApiConfigService;
  let walletService: MockWalletService;

  beforeAll(async () => {
    apiConfigService = {
      dbUrl: process.env.MONGO_URL,
      isTestMode: false,
      bitcoinApi: 'mock',
      loggerService: 'null'
    } as ApiConfigService;
    const mongoService = new MongoService(apiConfigService);
    await mongoService.connect();
    dbService = new DbService(mongoService, apiConfigService);
    walletService = new MockWalletService(dbService);
    await walletService.reset();
  });

  afterAll(async () => {
    await dbService.close();
  });

  test('exchange has a balance', async () => {
    const bitcoinService = new MockBitcoinService(dbService);
    const exchangeBalance = await bitcoinService.getWalletBalance(exchangeVpub);
    expect(exchangeBalance).toBe(30000000);
  });
});
