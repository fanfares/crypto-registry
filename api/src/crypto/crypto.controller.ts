import { Controller, Get, Param } from '@nestjs/common';
import { BitcoinService, Transaction } from './bitcoin.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { isValidZpub } from './is-valid-zpub';
import { IsValid } from '@bcr/types';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private cryptoService: BitcoinService) {
  }

  @ApiResponse({ type: Number })
  @Get('address-balance/:address')
  async getAddressBalance(@Param('address') address: string): Promise<number> {
    return await this.cryptoService.getAddressBalance(address);
  }

  @ApiResponse({ type: Number })
  @Get('wallet-balance/:zpub')
  async getWalletBalance(@Param('zpub') zpub: string): Promise<number> {
    return await this.cryptoService.getWalletBalance(zpub);
  }

  @ApiResponse({ type: IsValid })
  @Get('validate-zpub/:zpub')
  async validateZpub(@Param('zpub') zpub: string): Promise<IsValid> {
    return { isValid: isValidZpub(zpub) };
  }

  @ApiResponse({ type: Transaction })
  @Get('tx/:txid')
  async getTransaction(@Param('txid') txid: string): Promise<Transaction> {
    return await this.cryptoService.getTransaction(txid);
  }

  @ApiResponse({ type: Transaction, isArray: true })
  @Get('address-tx/:address')
  async getTransactionsForAddress(@Param('address') address: string): Promise<Transaction[]> {
    return await this.cryptoService.getTransactionsForAddress(address);
  }
}
