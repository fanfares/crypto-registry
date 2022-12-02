import { createTestData, TestData } from './create-test-data';
import { CustomerHoldingsDbService } from '../customer';
import { TestingModule } from '@nestjs/testing';
import { ExchangeDbService } from '../exchange';
import { ApiConfigService } from '../api-config/api-config.service';
import { ResetDataOptions } from '../types/reset-data-options-dto.type';

export const createTestDataFromModule = async (
  module: TestingModule,
  options?: ResetDataOptions
): Promise<TestData> => {
  const customerHoldingDbService = module.get<CustomerHoldingsDbService>(CustomerHoldingsDbService,);
  const exchangeDbService = module.get<ExchangeDbService>(ExchangeDbService);
  const apiConfigService = module.get<ApiConfigService>(ApiConfigService);
  return await createTestData(exchangeDbService, customerHoldingDbService, apiConfigService, options)
}
