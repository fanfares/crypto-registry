import { Injectable, Body } from '@nestjs/common';
import { BlockChainService } from '../block-chain/block-chain.service';
import { ApiConfigService } from '../api-config/api-config.service';
import {
  CustomerHoldingsDto,
  SubmissionResult,
  UserIdentity,
  CustomerHolding,
  CustodianBase,
  CustomerHoldingBase,
  RegistrationCheckResult
} from '@bcr/types';
import { CustodianDbService } from './custodian-db.service';
import { CustomerHoldingsDbService } from '../customer';

@Injectable()
export class CustodianService {
  constructor(
    private blockChainService: BlockChainService,
    private apiConfigService: ApiConfigService,
    private custodianDbService: CustodianDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService
  ) {
  }

  async checkRegistration(custodianPK: string): Promise<boolean> {
    return this.blockChainService.isPaymentMade(custodianPK, this.apiConfigService.registrationCost)
  }

  async submitCustodianHoldings(
    @Body() body: CustomerHoldingsDto
  ): Promise<SubmissionResult> {

    if (!await this.checkRegistration(body.publicKey)) {
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
    if (missingBitCoin > this.apiConfigService.submissionErrorTolerance) {
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

    await this.customerHoldingsDbService.deleteMany({
      custodianId: custodianId
    }, creatorIdentity);

    const inserts: CustomerHoldingBase[] = body.customerHoldings.map(holding => ({
      hashedEmail: holding.hashedEmail,
      amount: holding.amount,
      custodianId: custodianId
    }));

    await this.customerHoldingsDbService.insertMany(inserts, creatorIdentity);

    return SubmissionResult.SUBMISSION_SUCCESSFUL;
  }
}
