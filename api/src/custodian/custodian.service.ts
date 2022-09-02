import { Injectable, BadRequestException } from '@nestjs/common';
import { BlockChainService } from '../block-chain/block-chain.service';
import { ApiConfigService } from '../api-config/api-config.service';
import {
  SubmissionResult,
  UserIdentity,
  CustomerHolding,
  CustomerHoldingBase,
  RegistrationCheckResult,
  CustodianDto,
  CustodianRecord
} from '@bcr/types';
import { CustodianDbService } from './custodian-db.service';
import { CustomerHoldingsDbService } from '../customer';
import { getUniqueIds } from '../utils/data';
import { BulkUpdate } from '../db/db-api.types';

@Injectable()
export class CustodianService {
  constructor(
    private blockChainService: BlockChainService,
    private apiConfigService: ApiConfigService,
    private custodianDbService: CustodianDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService
  ) {
  }

  async checkRegistration(custodianPK: string): Promise<RegistrationCheckResult> {
    const custodian = await this.custodianDbService.findOne({
      publicKey: custodianPK
    });
    if (!custodian) {
      return {
        isRegistered: false,
        isPaymentMade: false
      };
    }

    const isPaymentMade = await this.blockChainService.isPaymentMade(custodianPK, this.apiConfigService.registrationCost);

    return {
      isRegistered: true,
      isPaymentMade: isPaymentMade
    };
  }

  async submitCustodianHoldings(
    customerHoldings: CustomerHolding[]
  ): Promise<SubmissionResult> {
    const identity: UserIdentity = {
      type: 'anonymous'
    };
    const custodianPublicKeys = getUniqueIds('publicKey', customerHoldings);
    await this.validateCustodians(custodianPublicKeys, customerHoldings, identity);
    const custodians = await this.custodianDbService.find({
      publicKey: {$in: custodianPublicKeys}
    });

    await this.customerHoldingsDbService.deleteMany({
      custodianId: {$in: custodians.map(c => c._id)}
    }, identity);

    const inserts: CustomerHoldingBase[] = customerHoldings.map(holding => ({
      hashedEmail: holding.hashedEmail,
      amount: holding.amount,
      custodianId: (custodians.find(c => c.publicKey === holding.publicKey))._id
    }));

    await this.customerHoldingsDbService.insertMany(inserts, identity);

    return SubmissionResult.SUBMISSION_SUCCESSFUL;
  }

  private async validateCustodians(
    custodianPublicKeys: string[],
    customerHoldings: CustomerHolding[],
    identity: UserIdentity
  ): Promise<void> {

    const updates: BulkUpdate<CustodianRecord>[] = [];

    for (const custodianPublicKey of custodianPublicKeys) {
      const custodianRegistrationCheck = await this.checkRegistration(custodianPublicKey);
      if (!custodianRegistrationCheck.isRegistered) {
        throw new BadRequestException(SubmissionResult.UNREGISTERED_CUSTODIAN);
      }
      if (!custodianRegistrationCheck.isPaymentMade) {
        throw new BadRequestException(SubmissionResult.CANNOT_FIND_BCR_PAYMENT);
      }

      const custodian = await this.custodianDbService.findOne({
        publicKey: custodianPublicKey
      });

      const blockChainBalance = await this.blockChainService.getCurrentBalance(custodianPublicKey);

      const totalCustomerHoldings = customerHoldings
        .filter(holding => holding.publicKey === custodianPublicKey)
        .reduce(
          (total: number, next: CustomerHolding) => {
            total += next.amount;
            return total;
          }, 0);

      const missingBitCoin = totalCustomerHoldings - blockChainBalance;
      if (missingBitCoin > this.apiConfigService.submissionErrorTolerance) {
        throw new BadRequestException(SubmissionResult.CANNOT_MATCH_CUSTOMER_HOLDINGS_TO_BLOCKCHAIN);
      }

      updates.push({
        id: custodian._id,
        modifier: {
          totalCustomerHoldings: totalCustomerHoldings,
          blockChainBalance: blockChainBalance
        }
      });
    }
    await this.custodianDbService.bulkUpdate(updates, identity);
  }


  async getCustodianDtos(): Promise<CustodianDto[]> {
    const custodians = await this.custodianDbService.find({});

    return custodians.map(c => ({
      _id: c._id,
      custodianName: c.custodianName,
      publicKey: c.publicKey,
      isRegistered: false
    }));
  }

}
