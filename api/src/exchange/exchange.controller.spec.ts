import { ExchangeController } from './exchange.controller';
import { CustomerHoldingsDbService } from '../customer';
import { SubmissionResult } from '@bcr/types';
import { createTestModule } from '../testing/create-test-module';
import { TestingModule } from '@nestjs/testing/testing-module';
import { createTestDataFromModule } from '../testing/create-test-data-from-module';

describe('Exchange Controller', () => {
  let controller: ExchangeController;
  let holdingsDbService: CustomerHoldingsDbService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    controller = module.get<ExchangeController>(ExchangeController);
    holdingsDbService = module.get<CustomerHoldingsDbService>(
      CustomerHoldingsDbService,
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should submit holdings', async () => {
    expect(controller).toBeDefined();
    const result = await controller.submitHoldings({
      customerHoldings: [
        {
          exchangeKey: 'exchange-1',
          hashedEmail: 'any@any.com',
          amount: 1000,
        },
      ],
    });
    expect(result).toBe(SubmissionResult.SUBMISSION_SUCCESSFUL);
    const holdings = await holdingsDbService.findOne({
      hashedEmail: 'any@any.com',
    });
    expect(holdings.amount).toBe(1000);
  });
});
