import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Transaction } from './bitcoin.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { isValidExtendedKey } from './is-valid-extended-key';
import { ExtendedKeyValidationResult, Network, SignatureGeneratorRequestDto, SignatureGeneratorResultDto } from '@bcr/types';
import { BitcoinServiceFactory } from './bitcoin-service-factory';
import { Bip84Utils } from './bip84-utils';
import { address } from 'bitcoinjs-lib';

@ApiTags('bitcoin')
@Controller('bitcoin')
export class BitcoinController {
  constructor(
    private bitcoinServiceFactory: BitcoinServiceFactory
  ) {
  }

  @ApiResponse({type: SignatureGeneratorResultDto})
  @Post('sign-address')
  async signAddress(
    @Body() signAddressDto: SignatureGeneratorRequestDto
  ): Promise<SignatureGeneratorResultDto> {
    const bip84 = Bip84Utils.fromExtendedKey(signAddressDto.privateKey);
    let {index, change} = bip84.findAddress(signAddressDto.address);
    const network = Bip84Utils.getNetworkForExtendedKey(signAddressDto.privateKey);
    const {signature} = bip84.sign(index, change, signAddressDto.message);
    const derivationPath = Bip84Utils.getDerivationPath(signAddressDto.privateKey, index, change);
    const bitcoinService = this.bitcoinServiceFactory.getService(network);
    const balance = await bitcoinService.getAddressBalance(signAddressDto.address);
    return {
      index, change, network, signature, derivationPath, balance
    };
  }

  @ApiResponse({type: Number})
  @Get('address-balance/:network/:address')
  async getAddressBalance(
    @Param('address') address: string,
    @Param('network') network: Network
  ): Promise<number> {
    return await this.bitcoinServiceFactory.getService(network).getAddressBalance(address);
  }

  @ApiResponse({type: Number})
  @Get('wallet-balance/:network/:zpub')
  async getWalletBalance(
    @Param('zpub') zpub: string,
    @Param('network') network: Network
  ): Promise<number> {
    return await this.bitcoinServiceFactory.getService(network).getWalletBalance(zpub);
  }

  @ApiResponse({type: ExtendedKeyValidationResult})
  @Get('validate-extended-key/:zpub')
  async validateExtendedKey(
    @Param('zpub') zpub: string
  ): Promise<ExtendedKeyValidationResult> {
    return isValidExtendedKey(zpub);
  }

  @ApiResponse({type: Transaction})
  @Get('tx/:network/:txid')
  async getTransaction(
    @Param('txid') txid: string,
    @Param('network') network: Network
  ): Promise<Transaction> {
    return await this.bitcoinServiceFactory.getService(network).getTransaction(txid);
  }

  @ApiResponse({type: Transaction, isArray: true})
  @Get('address-tx/:network/:address')
  async getTransactionsForAddress(
    @Param('address') address: string,
    @Param('network') network: Network
  ): Promise<Transaction[]> {
    return await this.bitcoinServiceFactory.getService(network).getTransactionsForAddress(address);
  }
}
