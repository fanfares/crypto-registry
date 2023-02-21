import { DbService } from '../db/db.service';
import { MongoService } from '../db';
import { ApiConfigService } from '../api-config';
import { resetRegistryWalletHistory } from './reset-registry-wallet-history';
import { testnetRegistryZpub } from './exchange-mnemonic';
import { BlockstreamBitcoinService } from './blockstream-bitcoin.service';
import { Network } from '@bcr/types';
import { Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from './bitcoin-service-factory';

jest.setTimeout(100000)

describe('reset-registry-wallet-history', () => {
  let dbService: DbService;
  let bitcoinServiceFactory: BitcoinServiceFactory;
  let apiConfigService: ApiConfigService;

  beforeAll(async () => {
    apiConfigService = {
      dbUrl: process.env.MONGO_URL,
      isTestMode: false,
      getRegistryZpub(network: Network): string { //eslint-disable-line
        return testnetRegistryZpub;
      }
    } as ApiConfigService;
    const mongoService = new MongoService(apiConfigService);
    await mongoService.connect();
    dbService = new DbService(mongoService, apiConfigService);
    const bitcoinService = new BlockstreamBitcoinService(Network.testnet, new Logger());
    bitcoinServiceFactory = new BitcoinServiceFactory()
    bitcoinServiceFactory.setService(Network.testnet, bitcoinService)
  });

  afterAll(async () => {
    await dbService.close();
  });

  test('wallet history is initialised', async () => {
    await resetRegistryWalletHistory(dbService, apiConfigService, bitcoinServiceFactory, Network.testnet);
    const walletCount = await dbService.walletAddresses.count({});
    expect(walletCount).toBe(34);
  });
});
