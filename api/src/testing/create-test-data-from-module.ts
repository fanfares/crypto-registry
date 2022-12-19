import { createTestData, TestDataOptions, TestIds } from './create-test-data';
import { TestingModule } from '@nestjs/testing';
import { ApiConfigService } from '../api-config';
import { SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';

export const createTestDataFromModule = async (
  module: TestingModule,
  options?: TestDataOptions
): Promise<TestIds> => {
  const dbService = module.get<DbService>(DbService);
  const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
  const exchangeService = module.get<SubmissionService>(SubmissionService);
  const walletService = module.get<WalletService>(WalletService);

  return await createTestData(
    dbService,
    apiConfigService,
    exchangeService,
    walletService,
    options
  );
};
