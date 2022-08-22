import { Test, TestingModule } from '@nestjs/testing';
import { BlockChainService } from './block-chain.service';
import { ApiConfigService } from '../api-config/api-config.service';
import { EmailConfig } from '../api-config/email-config.model';

describe('BlockChainService', () => {
  let service: BlockChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockChainService, {
        provide: ApiConfigService, useFactory: () => {
          return {
            maxBalanceTolerance: 100000,
            dbUrl: 'mongoDb:localhost:27017/testing',
            registryPublicKey:'publickey',
            email: {
              host: '',
              user: '',
              password: '',
              fromEmail: '',
              fromEmailName: ''
            }
          };
        }
      }]
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
