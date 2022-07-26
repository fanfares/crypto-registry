import { Test, TestingModule } from '@nestjs/testing';
import { BlockChainService } from './block-chain.service';

describe('BlockChainService', () => {
  let service: BlockChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockChainService]
    }).compile();

    service = module.get<BlockChainService>(BlockChainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
