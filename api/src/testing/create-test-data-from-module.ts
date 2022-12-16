import { createTestData, TestDataOptions, TestIds } from './create-test-data';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { TestingModule } from '@nestjs/testing';
import { ApiConfigService } from '../api-config';
import { MockAddressDbService } from '../crypto';
import { SubmissionService, SubmissionDbService } from '../submission';
import { ExchangeDbService } from '../exchange';
import { WalletService } from '../crypto/wallet.service';

export const createTestDataFromModule = async (
  module: TestingModule,
  options?: TestDataOptions
): Promise<TestIds> => {
  const customerHoldingDbService = module.get<CustomerHoldingsDbService>(CustomerHoldingsDbService);
  const exchangeDbService = module.get<ExchangeDbService>(ExchangeDbService);
  const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
  const submissionDbService = module.get<SubmissionDbService>(SubmissionDbService);
  const mockAddressDbService = module.get<MockAddressDbService>(MockAddressDbService);
  const exchangeService = module.get<SubmissionService>(SubmissionService);
  const walletService = module.get<WalletService>(WalletService);

  return await createTestData(
    exchangeDbService,
    customerHoldingDbService,
    submissionDbService,
    apiConfigService,
    mockAddressDbService,
    exchangeService,
    walletService,
    options
  );
};
