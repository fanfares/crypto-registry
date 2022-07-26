import { Test, TestingModule } from '@nestjs/testing';
import { CustomerHoldingController } from './customer-holding.controller';

describe('CustomerHoldingController', () => {
  let controller: CustomerHoldingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerHoldingController]
    }).compile();

    controller = module.get<CustomerHoldingController>(CustomerHoldingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
