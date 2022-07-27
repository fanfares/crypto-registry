import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { CustodianWalletService } from './custodian-wallet.service';
import {
  CustodianWalletRecord,
  CustomerHoldingBase,
  UserIdentity,
  RegisterCustodianWalletDto,
  CustomerHolding,
  WalletStatus,
  CustodianWalletBase
} from '@bcr/types';
import { CustomerHoldingService } from '../customer-holding';
import { BlockChainService } from '../block-chain/block-chain.service';
import { ConfigService } from '../config/config.service';

@ApiTags('custodian-wallet')
@Controller('custodian-wallet')
export class CustodianWalletController {
  constructor(private custodianWalletService: CustodianWalletService,
              private customerHoldingService: CustomerHoldingService,
              private blockChainService: BlockChainService,
              private configService: ConfigService
  ) {
  }

  @Get()
  @ApiResponse({type: CustodianWalletRecord, isArray: true})
  getAllCustodians(): Promise<CustodianWalletRecord[]> {
    return this.custodianWalletService.find({});
  }

  @Post()
  @ApiBody({type: RegisterCustodianWalletDto})
  async registerCustodianWallet(
    @Body() body: RegisterCustodianWalletDto
  ): Promise<void> {

    const creatorIdentity: UserIdentity = {
      type: 'custodian',
      id: 'tbc'
    };

    if ( !await this.blockChainService.isPaymentMade(body.publicKey) ){
      throw new BadRequestException('No payment made');
    }

    // todo - search for a transaction with csr public key
    // todo - if valid, then validate that the total customer holdings add up to the wallet balance.

    const blockChainBalance = await this.blockChainService.getCurrentBalance(body.publicKey);

    const totalCustomerHoldings = body.customerHoldings.reduce((total: number, next: CustomerHolding) => {
      total += next.amount;
      return total;
    }, 0);

    const missingBitCoin = totalCustomerHoldings - blockChainBalance;
    let status = WalletStatus.GREEN;
    if ( missingBitCoin > this.configService.redTolerance) {
      status = WalletStatus.RED
    } else if ( missingBitCoin > this.configService.amberTolerance) {
      status = WalletStatus.AMBER
    }


    let custodianWallet = await this.custodianWalletService.findOne({
      publicKey: body.publicKey
    });
    let custodianWalletId: string;

    const custodianWalletData: CustodianWalletBase = {
      custodianName: body.custodianName,
      status: status,
      publicKey: body.publicKey,
      totalCustomerHoldings: totalCustomerHoldings,
      blockChainBalance: blockChainBalance
    };

    if (!custodianWallet) {
      custodianWalletId = await this.custodianWalletService.insert(custodianWalletData, creatorIdentity);
    } else {
      custodianWalletId = custodianWallet._id;
      await this.custodianWalletService.update(custodianWalletId, custodianWalletData, creatorIdentity);
    }

    await this.customerHoldingService.deleteMany({
      custodianWalletId
    }, creatorIdentity);

    const inserts: CustomerHoldingBase[] = body.customerHoldings.map(holding => ({
      hashedEmail: holding.hashedEmail,
      amount: holding.amount,
      custodianWalletId: custodianWalletId
    }));

    await this.customerHoldingService.insertMany(inserts, creatorIdentity);

  }
}
