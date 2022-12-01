import { BadRequestException, Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { ApiConfigService } from '../api-config/api-config.service';
import {
  ExchangeDto,
  ExchangeRecord,
  CustomerHolding,
  CustomerHoldingBase,
  RegistrationCheckResult,
  SubmissionResult,
  UserIdentity,
} from '@bcr/types';
import { ExchangeDbService } from './exchange.db.service';
import { CustomerHoldingsDbService } from '../customer';
import { getUniqueIds } from '../utils/data';
import { BulkUpdate } from '../db/db-api.types';

@Injectable()
export class ExchangeService {
  constructor(
    private cryptoService: CryptoService,
    private apiConfigService: ApiConfigService,
    private custodianDbService: ExchangeDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService,
  ) {}

  async checkRegistration(
    exchangeKey: string,
  ): Promise<RegistrationCheckResult> {
    const custodian = await this.custodianDbService.findOne({
      publicKey: exchangeKey,
    });
    if (!custodian) {
      return {
        isRegistered: false,
        isPaymentMade: false,
      };
    }

    const isPaymentMade = await this.cryptoService.isPaymentMade(exchangeKey);

    return {
      isRegistered: true,
      isPaymentMade: isPaymentMade,
    };
  }

  async submitHoldings(
    customerHoldings: CustomerHolding[],
  ): Promise<SubmissionResult> {
    const identity: UserIdentity = {
      type: 'anonymous',
    };
    const custodianPublicKeys = getUniqueIds('publicKey', customerHoldings);
    await this.validateCustodians(
      custodianPublicKeys,
      customerHoldings,
      identity,
    );
    const exchanges = await this.custodianDbService.find({
      publicKey: { $in: custodianPublicKeys },
    });

    await this.customerHoldingsDbService.deleteMany(
      {
        custodianId: { $in: exchanges.map((c) => c._id) },
      },
      identity,
    );

    const inserts: CustomerHoldingBase[] = customerHoldings.map((holding) => ({
      hashedEmail: holding.hashedEmail,
      amount: holding.amount,
      exchangeId: exchanges.find((c) => c.publicKey === holding.publicKey)
        ._id,
    }));

    await this.customerHoldingsDbService.insertMany(inserts, identity);

    return SubmissionResult.SUBMISSION_SUCCESSFUL;
  }

  private async validateCustodians(
    custodianPublicKeys: string[],
    customerHoldings: CustomerHolding[],
    identity: UserIdentity,
  ): Promise<void> {
    const updates: BulkUpdate<ExchangeRecord>[] = [];

    for (const custodianPublicKey of custodianPublicKeys) {
      const custodianRegistrationCheck = await this.checkRegistration(
        custodianPublicKey,
      );
      if (!custodianRegistrationCheck.isRegistered) {
        throw new BadRequestException(SubmissionResult.UNREGISTERED_CUSTODIAN);
      }
      if (!custodianRegistrationCheck.isPaymentMade) {
        throw new BadRequestException(SubmissionResult.CANNOT_FIND_BCR_PAYMENT);
      }

      const custodian = await this.custodianDbService.findOne({
        publicKey: custodianPublicKey,
      });

      const blockChainBalance = await this.cryptoService.getBalance(
        custodianPublicKey,
      );

      const totalCustomerHoldings = customerHoldings
        .filter((holding) => holding.publicKey === custodianPublicKey)
        .reduce((total: number, next: CustomerHolding) => {
          total += next.amount;
          return total;
        }, 0);

      const missingBitCoin = totalCustomerHoldings - blockChainBalance;
      if (missingBitCoin > this.apiConfigService.submissionErrorTolerance) {
        throw new BadRequestException(
          SubmissionResult.CANNOT_MATCH_CUSTOMER_HOLDINGS_TO_BLOCKCHAIN,
        );
      }

      updates.push({
        id: custodian._id,
        modifier: {
          totalCustomerHoldings: totalCustomerHoldings,
          blockChainBalance: blockChainBalance,
        },
      });
    }
    await this.custodianDbService.bulkUpdate(updates, identity);
  }

  async getCustodianDtos(): Promise<ExchangeDto[]> {
    const custodians = await this.custodianDbService.find({});

    return custodians.map((c) => ({
      _id: c._id,
      custodianName: c.custodianName,
      publicKey: c.publicKey,
      isRegistered: false,
    }));
  }
}
