import { Test, TestingModule } from '@nestjs/testing';
import { BlockChainService } from './block-chain.service';
import { ApiConfigService } from '../config/api-config.service';

describe('BlockChainService', () => {
  let service: BlockChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockChainService, ApiConfigService]
    }).compile();

    service = module.get<BlockChainService>(BlockChainService);
  });

  it('should check custodian payment is made', async () => {
    const custodian = '329koRvovTyNnd4ADrpR2uJHzXxfvKxta5';
    const hasMadePayment = await service.isPaymentMade(custodian);
    expect(hasMadePayment).toBe(true);
  });

  it('should check custodian payment is not made', async () => {
    const custodian = 'any';
    const hasMadePayment = await service.isPaymentMade(custodian);
    expect(hasMadePayment).toBe(false);
  });
});
