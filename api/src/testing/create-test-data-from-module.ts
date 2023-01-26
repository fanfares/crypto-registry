import { createTestData, TestDataOptions, TestIds } from './create-test-data';
import { TestingModule } from '@nestjs/testing';
import { ApiConfigService } from '../api-config';
import { SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { P2pService } from '../p2p/p2p.service';

export const createTestDataFromModule = async (
  module: TestingModule,
  options?: TestDataOptions
): Promise<TestIds> => {
  const dbService = module.get<DbService>(DbService);
  const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
  const exchangeService = module.get<SubmissionService>(SubmissionService);
  const walletService = module.get<WalletService>(WalletService);
  const p2pService = module.get<P2pService>(P2pService);

  return await createTestData(
    dbService,
    apiConfigService,
    exchangeService,
    walletService,
    p2pService,
    options
  );
};
