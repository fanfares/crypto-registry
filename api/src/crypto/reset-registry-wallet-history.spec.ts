import { DbService } from '../db/db.service';
import { BitcoinService } from './bitcoin.service';
import { MongoService } from '../db';
import { ApiConfigService } from '../api-config';
import { resetRegistryWalletHistory } from './reset-registry-wallet-history';
import { testnetRegistryZpub } from './exchange-mnemonic';
import { BlockstreamBitcoinService } from './blockstream-bitcoin.service';
import { Network } from '@bcr/types';
import { Logger } from '@nestjs/common';

describe('reset-registry-wallet-history', () => {
  let dbService: DbService;
  let bitcoinService: BitcoinService;
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
    bitcoinService = new BlockstreamBitcoinService(Network.testnet, new Logger());
  });

  afterAll(async () => {
    await dbService.close();
  });

  test('wallet history is initialised', async () => {
    await resetRegistryWalletHistory(bitcoinService, dbService, apiConfigService, Network.testnet);
    const walletCount = await dbService.walletAddresses.count({});
    expect(walletCount).toBe(28);
  });
});
