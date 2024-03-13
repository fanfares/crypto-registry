import { DbService } from '../db/db.service';
import { MongoService } from '../db';
import { ApiConfigService } from '../api-config';
import { exchangeVpub, faucetZpub, testnetRegistryZpub } from '../crypto';
import { Network } from '@bcr/types';
import { TestLoggerService } from "../utils/logging";
import { MockWalletService } from "./mock-wallet.service";
import { MockBitcoinService } from './mock-bitcoin.service';
import { Logger } from '@nestjs/common'

describe('mock-wallet-service', () => {
  let dbService: DbService;
  let apiConfigService: ApiConfigService;
  let walletService: MockWalletService
  let logger: Logger;

  beforeAll(async () => {
    apiConfigService = {
      dbUrl: process.env.MONGO_URL,
      isTestMode: false,
      bitcoinApi: 'mock',
    } as ApiConfigService;
    logger = new TestLoggerService()
    const mongoService = new MongoService(apiConfigService, logger);
    await mongoService.connect();
    dbService = new DbService(mongoService, apiConfigService);
    walletService = new MockWalletService(dbService, logger);
    await walletService.reset()
  });

  afterAll(async () => {
    await dbService.close();
  });

  test('exchange has a balance', async () => {
    const bitcoinService = new MockBitcoinService(dbService, logger)
    const exchangeBalance = await bitcoinService.getWalletBalance(exchangeVpub);
    expect(exchangeBalance).toBe( 30000000);
  });
});
