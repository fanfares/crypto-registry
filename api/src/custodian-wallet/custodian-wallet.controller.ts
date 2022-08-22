import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { CustodianWalletService } from './custodian-wallet.service';
import {
  CustodianWalletRecord,
  CustomerHoldingBase,
  UserIdentity,
  RegisterCustodianWalletDto,
  CustomerHolding,
  CustodianWalletBase,
  WalletRegistrationResult
} from '@bcr/types';
import { CustomerHoldingService } from '../customer-holding';
import { BlockChainService } from '../block-chain/block-chain.service';
import { ApiConfigService } from '../api-config/api-config.service';

@ApiTags('custodian-wallet')
@Controller('custodian-wallet')
export class CustodianWalletController {
  constructor(private custodianWalletService: CustodianWalletService,
              private customerHoldingService: CustomerHoldingService,
              private blockChainService: BlockChainService,
              private configService: ApiConfigService
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
  ): Promise<WalletRegistrationResult> {

    if (!await this.blockChainService.isPaymentMade(body.publicKey)) {
      return WalletRegistrationResult.CANNOT_FIND_BCR_PAYMENT
    }

    const creatorIdentity: UserIdentity = {
      type: 'custodian',
      id: body.publicKey
    };

    const blockChainBalance = await this.blockChainService.getCurrentBalance(body.publicKey);

    const totalCustomerHoldings = body.customerHoldings.reduce((total: number, next: CustomerHolding) => {
      total += next.amount;
      return total;
    }, 0);

    const missingBitCoin = totalCustomerHoldings - blockChainBalance;
    if (missingBitCoin > this.configService.maxBalanceTolerance) {
      return WalletRegistrationResult.CANNOT_MATCH_CUSTOMER_HOLDINGS_TO_BLOCKCHAIN
    }

    let custodianWallet = await this.custodianWalletService.findOne({
      publicKey: body.publicKey
    });

    const custodianWalletData: CustodianWalletBase = {
      custodianName: body.custodianName,
      publicKey: body.publicKey,
      totalCustomerHoldings: totalCustomerHoldings,
      blockChainBalance: blockChainBalance
    };

    let custodianWalletId: string;
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

    return WalletRegistrationResult.SUBMISSION_SUCCESSFUL
  }
}
