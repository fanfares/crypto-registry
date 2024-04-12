import { BadRequestException, Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  BalanceCheckerRequestDto,
  BalanceCheckerResponseDto,
  GenerateAddressFileDto,
  FundingFileRequest,
  SignatureGeneratorRequestDto,
  SignatureGeneratorResultDto,
  ViewWalletRequestDto,
  WalletDto
} from '@bcr/types';
import { Response } from 'express';
import { Bip84Utils, getNetworkDefinitionFromKey } from '../crypto';
import { BlockstreamBitcoinService, getSignedAddresses } from '../bitcoin-service';
import { ApiConfigService } from '../api-config';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { ElectrumService } from '../electrum-api';
import { getWalletAddressesDto } from '../bitcoin-service/get-wallet-dto';
import { IsExchangeUserGuard } from '../exchange/is-exchange-user.guard';
import { getFundingCsvFromAddresses } from './get-funding-csv-from-addresses';
import { getTestFunding } from '../bitcoin-service/get-test-funding';

@ApiTags('tools')
@Controller('tools')
@UseGuards(IsExchangeUserGuard)
export class ToolsController {
  private logger = new Logger(ToolsController.name);

  constructor(
    private apiConfigService: ApiConfigService,
    private bitcoinServiceFactory: BitcoinServiceFactory
  ) {
  }

  @ApiResponse({type: WalletDto})
  @ApiBody({type: ViewWalletRequestDto})
  @Post('view-wallet')
  async viewWallet(
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

  @ApiResponse({type: BalanceCheckerResponseDto})
  @Post('balance-check')
  async balanceCheck(
    @Body() balanceCheckRequest: BalanceCheckerRequestDto
  ): Promise<BalanceCheckerResponseDto> {
    const network = Bip84Utils.getNetworkForAddress(balanceCheckRequest.address);
    const blockStreamApi = new BlockstreamBitcoinService(network);
    const electrumApi = new ElectrumService(network, this.apiConfigService);

    return {
      blockStreamBalance: await blockStreamApi.getAddressBalance(balanceCheckRequest.address),
      electrumBalance: await electrumApi.getAddressBalance(balanceCheckRequest.address),
      network: network
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
    const {index, change} = bip84.findAddress(signAddressDto.address);
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
    const blockDetail = await bitcoinService.getBlockDetails(signAddressDto.message, network);

    if (!blockDetail) {
      throw new BadRequestException('Invalid block has for network ' + network);
    }

    return {
      index, change, network, signature, derivationPath, balance,
      validFromDate: blockDetail.time
    };
  }

  @Post('generate-test-address-file')
  @ApiBody({type: GenerateAddressFileDto})
  async generateTestAddressFile(
    @Res() res: Response,
    @Body() body: GenerateAddressFileDto
  ) {
    try {
      const fileName = `${body.extendedPrivateKey}.csv`;
      const bitcoinService = this.bitcoinServiceFactory.getService(Bip84Utils.fromExtendedKey(body.extendedPrivateKey).network);
      const signedAddresses = await getSignedAddresses(body.extendedPrivateKey, body.message, bitcoinService);
      const data = getFundingCsvFromAddresses(signedAddresses);
      res.setHeader('access-control-expose-headers', 'content-disposition');
      res.setHeader('content-disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'text/csv');
      res.end(data);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('test-funding')
  async getTestFundingFile(
    @Res() res: Response,
    @Body() body: FundingFileRequest
  ) {
    try {
      const fileName = `test-funding-${body.network}.csv`;
      const bitcoinService = this.bitcoinServiceFactory.getService(body.network);
      const addresses = await getTestFunding(body.extendedKey, bitcoinService, body.lines);
      const data = getFundingCsvFromAddresses(addresses);
      res.setHeader('access-control-expose-headers', 'content-disposition');
      res.setHeader('content-disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'text/csv');
      res.end(data);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
