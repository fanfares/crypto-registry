import { ResetDataOptions } from '@bcr/types';
import { createTestExchanges } from './create-test-exchanges';
import { createTestFundingAddresses } from './create-test-funding-addresses';
import { createTestFundingSubmissions } from './create-test-funding-submissions';
import { DbService } from '../db/db.service';
import { BitcoinService, WalletService } from '../bitcoin-service';
import { createFunding } from './create-funding';
import { exchangeVpub } from '../crypto';
import { ExchangeService } from '../exchange/exchange.service';
import { createDefaultUsers } from './create-default-users';
import { createTestHoldings } from './create-test-holdings';

export const createTestData = async (
  db: DbService,
  bitcoinService: BitcoinService,
  walletService: WalletService,
  exchangeService: ExchangeService,
  options?: ResetDataOptions
): Promise<void> => {
  await db.reset(options?.retainUsers ?? false);
  await createFunding(walletService, exchangeVpub, options?.numberOfFundedAddresses ?? 0);
  await createTestExchanges(options?.numberOfExchanges ?? 0, db);
  await createTestFundingSubmissions(db, options?.numberOfFundingSubmissions ?? 0);
  await createTestFundingAddresses(db, bitcoinService, options?.numberOfFundingAddresses ?? 0);
  await createTestHoldings(db, options?.numberOfHoldings);

  if ( options?.createDefaultUsers ) {
    await createDefaultUsers(db);
  }

  const exchanges = await db.exchanges.find({})
  for (const exchange of exchanges) {
    await exchangeService.updateStatus(exchange._id)
  }
};
