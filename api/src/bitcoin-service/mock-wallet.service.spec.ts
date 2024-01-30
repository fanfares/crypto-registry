import { DbService } from '../db/db.service';
import { MongoService } from '../db';
import { ApiConfigService } from '../api-config';
import { faucetZpub, testnetExchangeZpub, testnetRegistryZpub } from '../crypto';
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
      getRegistryZpub(
        network: Network //eslint-disable-line
      ): string {
        return testnetRegistryZpub;
      }
    } as ApiConfigService;
    logger = new TestLoggerService()
    const mongoService = new MongoService(apiConfigService, logger);
    await mongoService.connect();
    dbService = new DbService(mongoService, apiConfigService);
    walletService = new MockWalletService(dbService, apiConfigService, logger);
    await walletService.reset()
  });

  afterAll(async () => {
    await dbService.close();
  });

  test('faucet has a balance', async () => {
    const bitcoinService = new MockBitcoinService(dbService, logger)
    const faucetBalance = await bitcoinService.getWalletBalance(faucetZpub);
    expect(faucetBalance).toBe(10000000000 - 30000000);
  });

  test('exchange has a balance', async () => {
    const bitcoinService = new MockBitcoinService(dbService, logger)
    const exchangeBalance = await bitcoinService.getWalletBalance(testnetExchangeZpub);
    expect(exchangeBalance).toBe( 30000000);
  });

  test('wallet history is initialised', async () => {
    const receivingAddress = await walletService.getReceivingAddress(testnetRegistryZpub)
    await walletService.sendFunds(testnetExchangeZpub, receivingAddress.address, 1000)
    const zpub = apiConfigService.getRegistryZpub(Network.testnet);
    expect(await walletService.getAddressCount(zpub)).toBe(1);
    await walletService.resetHistory(zpub)
    expect(await walletService.getAddressCount(zpub)).toBe(0);
  });
});
