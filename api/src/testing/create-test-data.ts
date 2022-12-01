import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer';
import { UserIdentity } from '@bcr/types';
import { ApiConfigService } from '../api-config/api-config.service';

export interface TestData {
  customerEmail: string;
  custodianId: string;
  custodianName: string;
  customerHoldingId: string;
}

export const createTestData = async (
  exchangeDbService: ExchangeDbService,
  customerHoldingsDbService: CustomerHoldingsDbService,
  apiConfigService: ApiConfigService
): Promise<TestData> => {
  await exchangeDbService.deleteMany({}, { type: 'reset' });
  await customerHoldingsDbService.deleteMany({}, { type: 'reset' });

  const customerEmail = 'rob@bitcoincustodianregistry.com';
  const exchangeName = 'Exchange-1';
  const exchangeIdentity: UserIdentity = { id: '1', type: 'exchange' };

  const exchangeId = await exchangeDbService.insert(
    {
      blockChainBalance: apiConfigService.registrationCost,
      custodianName: exchangeName,
      publicKey: 'exchange-1',
      totalCustomerHoldings: apiConfigService.registrationCost
    },
    exchangeIdentity
  );

  const customerHoldingId = await customerHoldingsDbService.insert(
    {
      amount: 1000,
      exchangeId: exchangeId,
      hashedEmail: customerEmail
    },
    exchangeIdentity
  );

  return {
    custodianId: exchangeId,
    customerEmail: customerEmail,
    customerHoldingId: customerHoldingId,
    custodianName: exchangeName
  };
};
