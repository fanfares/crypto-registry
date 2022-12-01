import { createTestData, TestData } from './create-test-data';
import { CustomerHoldingsDbService } from '../customer';
import { TestingModule } from '@nestjs/testing';
import { ExchangeDbService } from '../exchange';

export const createTestDataFromModule = async (module: TestingModule): Promise<TestData> => {
  const customerHoldingDbService = module.get<CustomerHoldingsDbService>(CustomerHoldingsDbService,);
  const exchangeDbService = module.get<ExchangeDbService>(ExchangeDbService);
  return await createTestData(exchangeDbService, customerHoldingDbService)
}
