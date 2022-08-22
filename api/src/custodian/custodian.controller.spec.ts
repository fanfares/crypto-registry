import { Test, TestingModule } from '@nestjs/testing';
import { CustodianController } from './custodian.controller';
import { BlockChainService } from '../block-chain/block-chain.service';

export class MockBlockChainService {
  async isPaymentMade(custodianPublicKey: string) {
    return true;
  }

  async getCurrentBalance (publicKey: string): Promise<number> {
    return 100;
  }
}

describe('CustodianController', () => {
  let controller: CustodianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustodianController],
      providers: [{
        provide: BlockChainService,
        useValue: new MockBlockChainService()
      }]
    }).compile();

    controller = module.get<CustodianController>(CustodianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
