import { CustodianController } from './custodian.controller';
import { CustomerHoldingsDbService } from '../customer';
import { SubmissionResult } from '@bcr/types';
import { createTestModule } from '../testing/create-test-module';

export class MockBlockChainService {
  async isPaymentMade(custodianPublicKey: string) {
    return true;
  }

  async getCurrentBalance(publicKey: string): Promise<number> {
    return 100;
  }
}

describe('CustodianController', () => {
  let controller: CustodianController;
  let holdingsDbService: CustomerHoldingsDbService;

  beforeEach(async () => {
    const module = await createTestModule();
    controller = module.get<CustodianController>(CustodianController);
    holdingsDbService = module.get<CustomerHoldingsDbService>(CustomerHoldingsDbService);
  });

  it('should create holdings', async () => {
    expect(controller).toBeDefined();
    const result = await controller.submitCustodianHoldings({
      publicKey: '123',
      custodianName: 'Rob Co',
      customerHoldings: [{
        hashedEmail: 'any@any.com',
        amount: 1000
      }]
    });
    expect(result).toBe(SubmissionResult.SUBMISSION_SUCCESSFUL);
    const holdings = await holdingsDbService.findOne({
      hashedEmail: 'any@any.com'
    });
    expect(holdings.amount).toBe(1000);
  });
});
