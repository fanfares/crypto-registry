import { Test, TestingModule } from '@nestjs/testing';
import { BlockChainController } from './block-chain.controller';

describe('BlockChainController', () => {
  let controller: BlockChainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockChainController]
    }).compile();

    controller = module.get<BlockChainController>(BlockChainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
