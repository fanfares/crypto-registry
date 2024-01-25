import { Body, Controller, Get, LoggerService, Param, Post } from '@nestjs/common';
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
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private logger: LoggerService
  ) {
  }

  @ApiResponse({type: SignatureGeneratorResultDto})
  @Post('sign-address')
  async signAddress(
    @Body() signAddressDto: SignatureGeneratorRequestDto
  ): Promise<SignatureGeneratorResultDto> {
    this.logger.log('Starting Address Signing');
    const bip84 = Bip84Utils.fromExtendedKey(signAddressDto.privateKey);
    this.logger.log('bip84.findAddress');
    let {index, change} = bip84.findAddress(signAddressDto.address);
    this.logger.log('Bip84Utils.getNetworkForExtendedKey');
    const network = Bip84Utils.getNetworkForExtendedKey(signAddressDto.privateKey);
    this.logger.log('bip84.sign');
    const {signature} = bip84.sign(index, change, signAddressDto.message);
    this.logger.log('Bip84Utils.getDerivationPath');
    const derivationPath = Bip84Utils.getDerivationPath(signAddressDto.privateKey, index, change);
    this.logger.log('this.bitcoinServiceFactory.getService');
    const bitcoinService = this.bitcoinServiceFactory.getService(network);
    this.logger.log('bitcoinService.getAddressBalance');
    const balance = 0;// await bitcoinService.getAddressBalance(signAddressDto.address);
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
