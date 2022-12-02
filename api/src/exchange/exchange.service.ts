import { BadRequestException, Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { ApiConfigService } from '../api-config/api-config.service';
import {
  ExchangeDto,
  CustomerHolding,
  CustomerHoldingBase,
  RegistrationCheckResult,
  SubmissionResult,
  UserIdentity,
} from '@bcr/types';
import { ExchangeDbService } from './exchange.db.service';
import { CustomerHoldingsDbService } from '../customer';
import { getUniqueIds } from '../utils/data';

@Injectable()
export class ExchangeService {
  constructor(
    private cryptoService: CryptoService,
    private apiConfigService: ApiConfigService,
    private exchangeDbService: ExchangeDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService,
  ) {}

  async checkRegistration(
    exchangeKey: string,
  ): Promise<RegistrationCheckResult> {
    const exchange = await this.exchangeDbService.findOne({
      publicKey: exchangeKey,
    });
    if (!exchange) {
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
    const exchangeKeys = getUniqueIds('exchangeKey', customerHoldings);
    await this.validateExchanges(exchangeKeys, customerHoldings);
    const exchanges = await this.exchangeDbService.find({
      publicKey: { $in: exchangeKeys },
    });

    await this.customerHoldingsDbService.deleteMany(
      {
        exchangeId: { $in: exchanges.map((c) => c._id) },
      },
      identity,
    );

    const inserts: CustomerHoldingBase[] = customerHoldings.map((holding) => ({
      hashedEmail: holding.hashedEmail,
      amount: holding.amount,
      exchangeId: exchanges.find((c) => c.publicKey === holding.exchangeKey)
        ._id,
    }));

    await this.customerHoldingsDbService.insertMany(inserts, identity);

    return SubmissionResult.SUBMISSION_SUCCESSFUL;
  }

  private async validateExchanges(
    exchangeKeys: string[],
    customerHoldings: CustomerHolding[],
  ): Promise<void> {
    for (const exchangeKey of exchangeKeys) {
      const exchangeCheck = await this.checkRegistration(exchangeKey);
      if (!exchangeCheck.isRegistered) {
        throw new BadRequestException(SubmissionResult.UNREGISTERED_EXCHANGE);
      }
      if (!exchangeCheck.isPaymentMade) {
        throw new BadRequestException(SubmissionResult.CANNOT_FIND_BCR_PAYMENT);
      }

      const blockChainBalance = await this.cryptoService.getBalance(
        exchangeKey,
      );

      const totalCustomerHoldings = customerHoldings
        .filter((holding) => holding.exchangeKey === exchangeKey)
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
    }
  }

  async getExchanges(): Promise<ExchangeDto[]> {
    const exchanges = await this.exchangeDbService.find({});

    return exchanges.map((c) => ({
      _id: c._id,
      exchangeName: c.exchangeName,
      publicKey: c.publicKey,
      isRegistered: false,
    }));
  }
}
