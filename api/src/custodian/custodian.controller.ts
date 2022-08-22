import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { CustodianDbService } from './custodian-db.service';
import {
  CustodianRecord,
  CustomerHoldingBase,
  UserIdentity,
  CustomerHoldingsDto,
  CustomerHolding,
  CustodianBase,
  SubmissionResult
} from '@bcr/types';
import { BlockChainService } from '../block-chain/block-chain.service';
import { ApiConfigService } from '../api-config/api-config.service';
import { CustomerHoldingsDbService } from '../customer';

@ApiTags('custodian')
@Controller('custodian')
export class CustodianController {
  constructor(private custodianDbService: CustodianDbService,
              private customerHoldingService: CustomerHoldingsDbService,
              private blockChainService: BlockChainService,
              private configService: ApiConfigService
  ) {
  }

  @Get()
  @ApiResponse({
    type: CustodianRecord,
    isArray: true
  })
  getAllCustodians(): Promise<CustodianRecord[]> {
    return this.custodianDbService.find({});
  }

  @Post('submit-holdings')
  @ApiBody({
    type: CustomerHoldingsDto
  })
  async submitCustodianHoldings(
    @Body() body: CustomerHoldingsDto
  ): Promise<SubmissionResult> {

    if (!await this.blockChainService.isPaymentMade(body.publicKey)) {
      return SubmissionResult.CANNOT_FIND_BCR_PAYMENT;
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
      return SubmissionResult.CANNOT_MATCH_CUSTOMER_HOLDINGS_TO_BLOCKCHAIN;
    }

    let custodianRecord = await this.custodianDbService.findOne({
      publicKey: body.publicKey
    });

    const custodianData: CustodianBase = {
      custodianName: body.custodianName,
      publicKey: body.publicKey,
      totalCustomerHoldings: totalCustomerHoldings,
      blockChainBalance: blockChainBalance
    };

    let custodianId: string;
    if (!custodianRecord) {
      custodianId = await this.custodianDbService.insert(custodianData, creatorIdentity);
    } else {
      custodianId = custodianRecord._id;
      await this.custodianDbService.update(custodianId, custodianData, creatorIdentity);
    }

    await this.customerHoldingService.deleteMany({
      custodianId: custodianId
    }, creatorIdentity);

    const inserts: CustomerHoldingBase[] = body.customerHoldings.map(holding => ({
      hashedEmail: holding.hashedEmail,
      amount: holding.amount,
      custodianId: custodianId
    }));

    await this.customerHoldingService.insertMany(inserts, creatorIdentity);

    return SubmissionResult.SUBMISSION_SUCCESSFUL;
  }
}
