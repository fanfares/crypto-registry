import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import {
  BalanceCheckerRequestDto,
  BalanceCheckerResponseDto,
  ExtendedKeyValidationResult,
  Network,
  SignatureGeneratorRequestDto,
  SignatureGeneratorResultDto,
  Transaction,
  ViewWalletRequestDto,
  WalletDto
} from '@bcr/types';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Bip84Utils, getNetworkDefinitionFromKey, isValidExtendedKey } from '../crypto';
import { BitcoinServiceFactory } from './bitcoin-service-factory';
import { BlockstreamBitcoinService } from './blockstream-bitcoin.service';
import { ElectrumService } from '../electrum-api';
import { ApiConfigService } from '../api-config';
import { getWalletAddressesDto } from './get-wallet-dto';

@ApiTags('bitcoin')
@Controller('bitcoin')
export class BitcoinController {
  constructor(
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private logger: Logger,
    private apiConfigService: ApiConfigService
  ) {
  }

  @ApiResponse({type: WalletDto})
  @ApiBody({type: ViewWalletRequestDto})
  @Post('generate-addresses')
  async generateAddresses(
    @Body() request: ViewWalletRequestDto
  ): Promise<WalletDto> {
    const network = Bip84Utils.getNetworkForExtendedKey(request.extendedKey);
    const bitcoinService = this.bitcoinServiceFactory.getService(network);
    const addresses = await getWalletAddressesDto(request.extendedKey, bitcoinService);
    const balance = addresses.reduce((bal, a) => bal + a.balance, 0);
    const networkDefinition = getNetworkDefinitionFromKey(request.extendedKey);
    return {
      addresses, balance,
      network: networkDefinition.network,
      scriptType: networkDefinition.scriptType,
      derivationPath: networkDefinition.path,
      typeDescription: networkDefinition.name
    };
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
    const balance = await bitcoinService.getAddressBalance(signAddressDto.address);
    return {
      index, change, network, signature, derivationPath, balance
    };
  }

  @ApiResponse({type: BalanceCheckerResponseDto})
  @Post('balance-check')
  async balanceCheck(
    @Body() balanceCheckRequest: BalanceCheckerRequestDto
  ): Promise<BalanceCheckerResponseDto> {
    const network = Bip84Utils.getNetworkForAddress(balanceCheckRequest.address);
    const blockStreamApi = new BlockstreamBitcoinService(network, this.logger);
    const electrumApi = new ElectrumService(network, this.logger, this.apiConfigService);

    return {
      blockStreamBalance: await blockStreamApi.getAddressBalance(balanceCheckRequest.address),
      electrumBalance: await electrumApi.getAddressBalance(balanceCheckRequest.address),
      network: network
    };
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
