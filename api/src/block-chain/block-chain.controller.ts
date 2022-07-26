import { Controller, Get, Param } from '@nestjs/common';
import { BlockChainService } from './block-chain.service';

@Controller('block-chain')
export class BlockChainController {
  constructor(
    private blockChainService: BlockChainService
  ) {
  }

  @Get('get-balance/:publicKey')
  async getBalance(@Param('publicKey') publicKey: string): Promise<any> {
    return await this.blockChainService.getCurrentBalance(publicKey);
  }
}
