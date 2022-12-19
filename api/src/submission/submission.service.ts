import { BadRequestException, Injectable } from '@nestjs/common';
import { BitcoinService } from '../crypto';
import { ApiConfigService } from '../api-config';
import {
  CreateSubmissionDto,
  CustomerHoldingBase,
  SubmissionStatus,
  SubmissionStatusDto,
  UserIdentity
} from '@bcr/types';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { SubmissionDbService } from './submission-db.service';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { minimumBitcoinPaymentInSatoshi } from '../utils';
import { WalletService } from '../crypto/wallet.service';
import { isTxsSendersFromWallet } from '../crypto/is-tx-sender-from-wallet';

const identity: UserIdentity = {
  type: 'anonymous'
};

@Injectable()
export class SubmissionService {
  constructor(
    private customerHoldingsDbService: CustomerHoldingsDbService,
    private bitcoinService: BitcoinService,
    private apiConfigService: ApiConfigService,
    private exchangeDbService: ExchangeDbService,
    private submissionDbService: SubmissionDbService,
    private walletService: WalletService
  ) {
  }

  async getSubmissionStatus(
    paymentAddress: string
  ): Promise<SubmissionStatusDto> {
    const submission = await this.submissionDbService.findOne({
      paymentAddress
    });
    if (!submission) {
      throw new BadRequestException('Invalid Address');
    }

    if (submission.status === SubmissionStatus.VERIFIED
      || submission.status === SubmissionStatus.CANCELLED
    ) {
      return submissionStatusRecordToDto(submission);
    }

    if (submission.status !== SubmissionStatus.WAITING_FOR_PAYMENT) {
      throw new BadRequestException('Invalid Status');
    }

    const addressBalance = await this.bitcoinService.getAddressBalance(paymentAddress);
    if (addressBalance >= submission.paymentAmount) {
      const txs = await this.bitcoinService.getTransactionsForAddress(paymentAddress);
      const totalExchangeFunds = await this.bitcoinService.getWalletBalance(submission.exchangeZpub);
      let finalStatus = totalExchangeFunds  >= (submission.totalCustomerFunds * this.apiConfigService.reserveLimit) ? SubmissionStatus.VERIFIED : SubmissionStatus.INSUFFICIENT_FUNDS;
      if ( !isTxsSendersFromWallet(txs, submission.exchangeZpub)) {
        finalStatus = SubmissionStatus.SENDER_MISMATCH
      }

      await this.submissionDbService.update(
        submission._id, {
          status: finalStatus,
          totalExchangeFunds: totalExchangeFunds
        }, identity);

      return submissionStatusRecordToDto({
        ...submission,
        status: finalStatus,
        totalExchangeFunds: totalExchangeFunds
      });

    } else {
      return submissionStatusRecordToDto(submission);
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
    submission: CreateSubmissionDto
  ): Promise<SubmissionStatusDto> {
    const identity: UserIdentity = {
      type: 'anonymous'
    };

    const totalCustomerFunds = submission.customerHoldings.reduce((amount, holding) => amount + holding.amount, 0);
    const paymentAmount = Math.max(totalCustomerFunds * this.apiConfigService.paymentPercentage, minimumBitcoinPaymentInSatoshi);
    const totalExchangeFunds = await this.bitcoinService.getWalletBalance(submission.exchangeZpub);
    const paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.registryZpub, 'Registry');

    await this.submissionDbService.insert({
      paymentAddress: paymentAddress,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      totalExchangeFunds: totalExchangeFunds,
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
      exchangeName: submission.exchangeName,
      exchangeZpub: submission.exchangeZpub
    }, identity);

    const inserts: CustomerHoldingBase[] =
      submission.customerHoldings.map((holding) => ({
        hashedEmail: holding.hashedEmail,
        amount: holding.amount,
        paymentAddress: paymentAddress
      }));

    await this.customerHoldingsDbService.insertMany(inserts, identity);

    return {
      paymentAddress: paymentAddress,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
      exchangeName: submission.exchangeName
    };
  }
}
