import { Test, TestingModule } from '@nestjs/testing';
import { CustodianWalletController } from './custodian-wallet.controller';
import { BlockChainService } from '../block-chain/block-chain.service';
import { WalletVerificationDto } from '@bcr/types';

export class MockBlockChainService {
  async isPaymentMade(custodianPublicKey: string) {
    return true;
  }

  async getCurrentBalance (publicKey: string): Promise<number> {
    return 100;
  }
}

describe('CustodianController', () => {
  let controller: CustodianWalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustodianWalletController],
      providers: [{
        provide: BlockChainService,
        useValue: new MockBlockChainService()
      }]
    }).compile();

    controller = module.get<CustodianWalletController>(CustodianWalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();

    let x: WalletVerificationDto;
  });
});
