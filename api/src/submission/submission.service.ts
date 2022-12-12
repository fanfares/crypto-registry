import { BadRequestException, Injectable } from '@nestjs/common';
import { BitcoinService } from '../crypto';
import { ApiConfigService } from '../api-config';
import { CustomerHoldingBase, SubmissionDto, SubmissionStatus, SubmissionStatusDto, UserIdentity } from '@bcr/types';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { SubmissionDbService } from './submission-db.service';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { minimumBitcoinPaymentInSatoshi } from '../utils';

const identity: UserIdentity = {
  type: 'anonymous'
};

@Injectable()
export class SubmissionService {
  constructor(
    private customerHoldingsDbService: CustomerHoldingsDbService,
    private cryptoService: BitcoinService,
    private apiConfigService: ApiConfigService,
    private exchangeDbService: ExchangeDbService,
    private submissionDbService: SubmissionDbService
  ) {
  }

  async getSubmissionStatus(
    paymentAddress: string
  ): Promise<SubmissionStatusDto> {
    const submissionRecord = await this.submissionDbService.findOne({
      paymentAddress
    });
    if (
      !submissionRecord ||
      submissionRecord.status === SubmissionStatus.UNUSED
    ) {
      throw new BadRequestException('Invalid Address');
    }

    if (submissionRecord.status === SubmissionStatus.VERIFIED
      || submissionRecord.status === SubmissionStatus.CANCELLED
    ) {
      return submissionStatusRecordToDto(submissionRecord);
    }

    if (submissionRecord.status !== SubmissionStatus.WAITING_FOR_PAYMENT) {
      throw new BadRequestException('Invalid Status');
    }

    const addressBalance = await this.cryptoService.getBalance(paymentAddress);
    if (addressBalance >= submissionRecord.paymentAmount) {

      const txs = await this.cryptoService.getTransactionsForAddress(paymentAddress);
      const totalExchangeFunds = txs.reduce((v, tx) => v + tx.inputValue, 0);
      const finalStatus = totalExchangeFunds >= submissionRecord.totalCustomerFunds ? SubmissionStatus.VERIFIED : SubmissionStatus.INSUFFICIENT_FUNDS

      await this.submissionDbService.update(
        submissionRecord._id, {
          status: finalStatus,
          totalExchangeFunds: totalExchangeFunds
        }, identity);

      return submissionStatusRecordToDto({
        ...submissionRecord,
        status: finalStatus,
        totalExchangeFunds: totalExchangeFunds
      });

    } else {
      return submissionStatusRecordToDto(submissionRecord);
    }
  }

  async cancel(address: string) {
    await this.submissionDbService.findOneAndUpdate({
      paymentAddress: address
    }, {
      status: SubmissionStatus.CANCELLED
    }, identity);
  }

  async createSubmission(
    submission: SubmissionDto
  ): Promise<SubmissionStatusDto> {
    const identity: UserIdentity = {
      type: 'anonymous'
    };

    const totalCustomerFunds = submission.customerHoldings.reduce(
      (amount, holding) => {
        return amount + holding.amount;
      }, 0);

    const paymentAmount = Math.max(totalCustomerFunds * this.apiConfigService.paymentPercentage, minimumBitcoinPaymentInSatoshi);

    const submissionRecord = await this.submissionDbService.findOneAndUpdate({
        status: SubmissionStatus.UNUSED
      }, {
        status: SubmissionStatus.WAITING_FOR_PAYMENT,
        totalCustomerFunds: totalCustomerFunds,
        paymentAmount: paymentAmount,
        exchangeName: submission.exchangeName
      },
      identity
    );

    const inserts: CustomerHoldingBase[] =
      submission.customerHoldings.map((holding) => ({
        hashedEmail: holding.hashedEmail,
        amount: holding.amount,
        paymentAddress: submissionRecord.paymentAddress
      }));

    await this.customerHoldingsDbService.insertMany(inserts, identity);

    return {
      paymentAddress: submissionRecord.paymentAddress,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
      exchangeName: submission.exchangeName
    };
  }


}
