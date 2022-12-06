import { BadRequestException, Injectable } from '@nestjs/common';
import { BitcoinService } from '../crypto/bitcoin.service';
import { ApiConfigService } from '../api-config/api-config.service';
import {
  CustomerHoldingBase,
  ExchangeDto,
  SubmissionDto,
  SubmissionStatus,
  SubmissionStatusDto,
  UserIdentity
} from '@bcr/types';
import { ExchangeDbService } from './exchange.db.service';
import { CustomerHoldingsDbService } from '../customer';
import { SubmissionDbService } from './submission-db.service';


const identity: UserIdentity = {
  type: 'anonymous'
};

@Injectable()
export class ExchangeService {
  constructor(
    private cryptoService: BitcoinService,
    private apiConfigService: ApiConfigService,
    private exchangeDbService: ExchangeDbService,
    private submissionDbService: SubmissionDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService
  ) {
  }

  async getSubmissionStatus(
    paymentAddress: string
  ): Promise<SubmissionStatusDto> {

    const submissionRecord = await this.submissionDbService.findOne({ paymentAddress });
    if (!submissionRecord || submissionRecord.submissionStatus === SubmissionStatus.UNUSED) {
      throw new BadRequestException('Invalid Address');
    }

    if (submissionRecord.submissionStatus === SubmissionStatus.COMPLETE) {
      return submissionRecord as SubmissionStatusDto;
    }

    if (submissionRecord.submissionStatus === SubmissionStatus.WAITING_FOR_PAYMENT) {
      const addressBalance = await this.cryptoService.getBalance(paymentAddress);
      if (addressBalance >= submissionRecord.paymentAmount) {
        await this.submissionDbService.update(submissionRecord._id, {
          submissionStatus: SubmissionStatus.COMPLETE
        }, identity);

        return {
          paymentAddress: submissionRecord.paymentAddress,
          paymentAmount: submissionRecord.paymentAmount,
          submissionStatus: SubmissionStatus.COMPLETE
        };
      }
    }

    return submissionRecord as SubmissionStatusDto;
  }

  async submitHoldings(
    exchangeSubmission: SubmissionDto
  ): Promise<SubmissionStatusDto> {
    const identity: UserIdentity = {
      type: 'anonymous'
    };

    const totalCustomerHoldings = exchangeSubmission.customerHoldings.reduce((amount, holding) => {
      return amount + holding.amount;
    }, 0);

    let submissionRecord = await this.submissionDbService.findOneAndUpdate({
      submissionStatus: SubmissionStatus.UNUSED
    }, {
      submissionStatus: SubmissionStatus.WAITING_FOR_PAYMENT,
      paymentAmount: totalCustomerHoldings * this.apiConfigService.paymentPercentage,
      exchangeName: exchangeSubmission.exchangeName
    }, identity);

    const inserts: CustomerHoldingBase[] = exchangeSubmission.customerHoldings.map(holding => ({
      hashedEmail: holding.hashedEmail,
      amount: holding.amount,
      submissionAddress: submissionRecord.paymentAddress
    }));

    await this.customerHoldingsDbService.insertMany(inserts, identity);

    return {
      paymentAddress: submissionRecord.paymentAddress,
      paymentAmount: totalCustomerHoldings,
      submissionStatus: SubmissionStatus.WAITING_FOR_PAYMENT
    };
  }

  async getExchanges(): Promise<ExchangeDto[]> {
    const exchanges = await this.exchangeDbService.find({});

    return exchanges.map((c) => ({
      _id: c._id,
      exchangeName: c.exchangeName,
      isRegistered: false
    }));
  }
}
