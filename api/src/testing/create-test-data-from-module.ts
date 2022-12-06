import { createTestData, TestDataOptions, TestIds } from './create-test-data';
import { CustomerHoldingsDbService } from '../customer';
import { TestingModule } from '@nestjs/testing';
import { ExchangeDbService } from '../exchange';
import { ApiConfigService } from '../api-config/api-config.service';
import { SubmissionDbService } from '../exchange/submission-db.service';
import { MockAddressDbService } from '../crypto/mock-address-db.service';
import { ExchangeService } from '../exchange/exchange.service';

export const createTestDataFromModule = async (
  module: TestingModule,
  options?: TestDataOptions
): Promise<TestIds> => {
  const customerHoldingDbService = module.get<CustomerHoldingsDbService>(
    CustomerHoldingsDbService
  );
  const exchangeDbService = module.get<ExchangeDbService>(ExchangeDbService);
  const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
  const submissionDbService =
    module.get<SubmissionDbService>(SubmissionDbService);
  const mockAddressDbService =
    module.get<MockAddressDbService>(MockAddressDbService);
  const exchangeService = module.get<ExchangeService>(ExchangeService);

  return await createTestData(
    exchangeDbService,
    customerHoldingDbService,
    submissionDbService,
    apiConfigService,
    mockAddressDbService,
    exchangeService,
    options
  );
};
