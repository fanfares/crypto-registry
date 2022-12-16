import { Controller, Get, Param } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private cryptoService: BitcoinService) {
  }

  @Get('address-balance/:address')
  async getAddressBalance(@Param('address') address: string): Promise<number> {
    return await this.cryptoService.getAddressBalance(address);
  }

  @Get('wallet-balance/:zpub')
  async getWalletBalance(@Param('zpub') address: string): Promise<number> {
    return await this.cryptoService.getWalletBalance(address);
  }

  @Get('tx/:txid')
  async getTransaction(@Param('txid') txid: string): Promise<any> {
    return await this.cryptoService.getTransaction(txid);
  }

  @Get('address-tx/:address')
  async getTransactionsForAddress(@Param('address') address: string): Promise<any> {
    return await this.cryptoService.getTransactionsForAddress(address);
  }
}
