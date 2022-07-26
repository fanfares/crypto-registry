import { Test, TestingModule } from '@nestjs/testing';
import { CustodianWalletController } from './custodian-wallet.controller';

describe('CustodianController', () => {
  let controller: CustodianWalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustodianWalletController]
    }).compile();

    controller = module.get<CustodianWalletController>(CustodianWalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
