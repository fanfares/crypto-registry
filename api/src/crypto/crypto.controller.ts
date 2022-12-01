import { Controller, Get, Param } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiConfigService } from '../api-config/api-config.service';
import { Transaction, TransactionDto } from '../types/transaction.type';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(
    private cryptoService: CryptoService,
    private apiConfigService: ApiConfigService
  ) {}

  @Get('balance/:publicKey')
  async getBalance(
    @Param('publicKey') publicKey: string
  ): Promise<number> {
    return await this.cryptoService.getBalance(publicKey);
  }

  @Get('transactions/:publicKey')
  async getTransaction(
    @Param('publicKey') publicKey: string
  ): Promise<TransactionDto[]> {
    return await this.cryptoService.getTransactions(publicKey,this.apiConfigService.registryKey);
  }
}
