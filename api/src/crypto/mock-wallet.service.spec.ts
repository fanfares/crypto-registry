import { DbService } from '../db/db.service';
import { MongoService } from '../db';
import { ApiConfigService } from '../api-config';
import { testnetExchangeZpub, testnetRegistryZpub } from './exchange-mnemonic';
import { Network } from '@bcr/types';
import { TestLoggerService } from "../utils/logging";
import { MockWalletService } from "./mock-wallet.service";

// jest.setTimeout(100000)

describe('mock-wallet-service', () => {
  let dbService: DbService;
  let apiConfigService: ApiConfigService;
  let walletService: MockWalletService

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
    const logger = new TestLoggerService()
    const mongoService = new MongoService(apiConfigService, logger);
    await mongoService.connect();
    dbService = new DbService(mongoService, apiConfigService);
    walletService = new MockWalletService(dbService, apiConfigService, logger);
    await walletService.reset()
    const receivingAddress = await walletService.getReceivingAddress(testnetRegistryZpub)
    await walletService.sendFunds(testnetExchangeZpub, receivingAddress.address, 1000)
  });

  afterAll(async () => {
    await dbService.close();
  });

  test('wallet history is initialised', async () => {
    const zpub = apiConfigService.getRegistryZpub(Network.testnet);
    expect(await walletService.getAddressCount(zpub)).toBe(1);
    await walletService.resetHistory(zpub)
    expect(await walletService.getAddressCount(zpub)).toBe(0);
  });
});
