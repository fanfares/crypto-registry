import { TestingModule } from '@nestjs/testing';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer';
import { UserIdentity } from '@bcr/types';
import { clearDb } from './clear-db';

export interface TestData {
  customerEmail: string;
  custodianId: string;
  custodianName: string;
  customerHoldingId: string;
}

export const createTestData = async (
  module: TestingModule,
): Promise<TestData> => {
  await clearDb(module);
  const customerEmail = 'customer-1@any.com';
  const exchangeName = 'Exchange-1';
  const exchangeIdentity: UserIdentity = { id: '1', type: 'exchange' };
  const exchangeService = module.get<ExchangeDbService>(ExchangeDbService);
  const exchangeId = await exchangeService.insert(
    {
      blockChainBalance: 1000,
      custodianName: exchangeName,
      publicKey: 'exchange-1',
      totalCustomerHoldings: 1000,
    },
    exchangeIdentity,
  );

  const customerHoldingsDbService = module.get<CustomerHoldingsDbService>(
    CustomerHoldingsDbService,
  );
  const customerHoldingId = await customerHoldingsDbService.insert(
    {
      amount: 1000,
      exchangeId: exchangeId,
      hashedEmail: customerEmail,
    },
    exchangeIdentity,
  );

  return {
    custodianId: exchangeId,
    customerEmail: customerEmail,
    customerHoldingId: customerHoldingId,
    custodianName: exchangeName,
  };
};
