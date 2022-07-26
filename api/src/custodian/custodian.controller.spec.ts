import { Test, TestingModule } from '@nestjs/testing';
import { CustodianController } from './custodian.controller';

describe('CustodianController', () => {
  let controller: CustodianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustodianController]
    }).compile();

    controller = module.get<CustodianController>(CustodianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
