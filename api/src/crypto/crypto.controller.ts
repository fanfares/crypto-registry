import { Controller, Get, Param } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private cryptoService: CryptoService) {}

  @Get('get-balance/:publicKey')
  async getBalance(@Param('publicKey') publicKey: string): Promise<number> {
    return await this.cryptoService.getBalance(publicKey);
  }
}
