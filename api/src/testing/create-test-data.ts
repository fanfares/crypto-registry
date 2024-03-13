import { ResetDataOptions } from '@bcr/types';
import { createTestExchanges } from './create-test-exchanges';
import { createTestFundingAddresses } from './create-test-funding-addresses';
import { createTestFundingSubmissions } from './create-test-funding-submissions';
import { DbService } from '../db/db.service';
import { BitcoinService, WalletService } from '../bitcoin-service';
import { ApiConfigService } from '../api-config';
import { createFunding } from './create-funding';
import { exchangeVpub } from '../crypto';

export const createTestData = async (
  db: DbService,
  bitcoinService: BitcoinService,
  apiConfigService: ApiConfigService,
  walletService: WalletService,
  options: ResetDataOptions
): Promise<void> => {
  // await db.exchanges.deleteMany({});
  // await db.holdings.deleteMany({});
  // await db.fundingSubmissions.deleteMany({});
  // await db.fundingAddresses.deleteMany({});
  // await db.verifications.deleteMany({});
  // await db.walletAddresses.deleteMany({})

  // if (options?.resetAll) {
    await db.reset();
    await db.users.insert({
      email: apiConfigService.ownerEmail,
      isVerified: false,
      isSystemAdmin: false
    });
  // }

  await createFunding(walletService, exchangeVpub, options?.numberOfFundedAddresses ?? 0);
  await createTestExchanges(options?.numberOfExchanges ?? 0, db);
  await createTestFundingSubmissions(db, options?.numberOfFundingSubmissions ?? 0);
  await createTestFundingAddresses(db, bitcoinService, options?.numberOfFundingAddresses ?? 0);
};
