import { DbService } from '../db/db.service';
import { MongoService } from '../db';
import { ApiConfigService } from '../api-config';
import { testnetExchangeZpub, testnetRegistryZpub } from './exchange-mnemonic';
import { Network } from '@bcr/types';
import { Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from './bitcoin-service-factory';
import { MockBitcoinService } from "./mock-bitcoin.service";
import { MockWalletService } from "./mock-wallet.service";

jest.setTimeout(100000)

describe('mock-wallet-service', () => {
  let dbService: DbService;
  let bitcoinServiceFactory: BitcoinServiceFactory;
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
    const mongoService = new MongoService(apiConfigService);
    await mongoService.connect();
    dbService = new DbService(mongoService, apiConfigService);
    const bitcoinService = new MockBitcoinService(dbService, apiConfigService, new Logger());
    bitcoinServiceFactory = new BitcoinServiceFactory()
    bitcoinServiceFactory.setService(Network.testnet, bitcoinService);
    const logger = new Logger();
    walletService = MockWalletService.getInstance(dbService, bitcoinServiceFactory, apiConfigService, logger);
    await walletService.reset()
    const receivingAddress = await walletService.getReceivingAddress(testnetRegistryZpub, 'Test')
    await walletService.sendFunds(testnetExchangeZpub, receivingAddress, 1000)

    console.log(await dbService.walletAddresses.find({}))
    console.log(await dbService.mockAddresses.find({}))
    console.log(await dbService.mockTransactions.find({}))


  });

  afterAll(async () => {
    await dbService.close();
  });

  test('wallet history is initialised', async () => {
    const zpub = apiConfigService.getRegistryZpub(Network.testnet);
    await walletService.resetHistory(zpub)
    const walletCount = await dbService.walletAddresses.count({});
    expect(walletCount).toBe(1);
  });
});
