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
  const custodianName = 'Exchange-1';
  const custodianIdentity: UserIdentity = { id: '1', type: 'custodian' };
  const custodianService = module.get<ExchangeDbService>(ExchangeDbService);
  const custodianId = await custodianService.insert(
    {
      blockChainBalance: 1000,
      custodianName: custodianName,
      publicKey: 'exchange-1-public-key',
      totalCustomerHoldings: 1000,
    },
    custodianIdentity,
  );

  const customerHoldingsDbService = module.get<CustomerHoldingsDbService>(
    CustomerHoldingsDbService,
  );
  const customerHoldingId = await customerHoldingsDbService.insert(
    {
      amount: 1000,
      custodianId: custodianId,
      hashedEmail: customerEmail,
    },
    custodianIdentity,
  );

  return {
    custodianId: custodianId,
    customerEmail: customerEmail,
    customerHoldingId: customerHoldingId,
    custodianName: custodianName,
  };
};
