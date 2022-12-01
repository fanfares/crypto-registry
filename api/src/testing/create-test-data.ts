import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer';
import { UserIdentity } from '@bcr/types';

export interface TestData {
  customerEmail: string;
  custodianId: string;
  custodianName: string;
  customerHoldingId: string;
}

export const createTestData = async (
  exchangeDbService: ExchangeDbService,
  customerHoldingsDbService: CustomerHoldingsDbService
): Promise<TestData> => {
  await exchangeDbService.deleteMany({}, { type: 'reset' });
  await customerHoldingsDbService.deleteMany({}, { type: 'reset' });

  const customerEmail = 'customer-1@any.com';
  const exchangeName = 'Exchange-1';
  const exchangeIdentity: UserIdentity = { id: '1', type: 'exchange' };

  const exchangeId = await exchangeDbService.insert(
    {
      blockChainBalance: 1000,
      custodianName: exchangeName,
      publicKey: 'exchange-1',
      totalCustomerHoldings: 1000
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
