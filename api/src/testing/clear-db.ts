import { TestingModule } from '@nestjs/testing';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer';
import { UserIdentity } from '@bcr/types';

export const clearDb = async (module: TestingModule) => {
  const testIdentity: UserIdentity = { id: 'test', type: 'anonymous' };
  const custodianService = module.get<ExchangeDbService>(ExchangeDbService);
  await custodianService.deleteMany({}, testIdentity);
  const customerHoldingsDbService = module.get<CustomerHoldingsDbService>(
    CustomerHoldingsDbService,
  );
  await customerHoldingsDbService.deleteMany({}, testIdentity);
};
