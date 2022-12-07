import { BadRequestException, Injectable } from '@nestjs/common';
import { BitcoinService } from '../crypto';
import { ApiConfigService } from '../api-config';
import { CustomerHoldingBase, SubmissionDto, SubmissionStatus, SubmissionStatusDto, UserIdentity } from '@bcr/types';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { SubmissionDbService } from './submission-db.service';
import { submissionStatusRecordToDto } from './submission-record-to-dto';

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
      submissionRecord.submissionStatus === SubmissionStatus.UNUSED
    ) {
      throw new BadRequestException('Invalid Address');
    }

    if (submissionRecord.submissionStatus === SubmissionStatus.COMPLETE
      || submissionRecord.submissionStatus === SubmissionStatus.CANCELLED
    ) {
      return submissionStatusRecordToDto(submissionRecord);
    }

    if (submissionRecord.submissionStatus !== SubmissionStatus.WAITING_FOR_PAYMENT) {
      throw new BadRequestException('Invalid Status');
    }

    const addressBalance = await this.cryptoService.getBalance(
      paymentAddress
    );

    if (addressBalance >= submissionRecord.paymentAmount) {
      await this.submissionDbService.update(
        submissionRecord._id,
        {
          submissionStatus: SubmissionStatus.COMPLETE
        },
        identity
      );

      return submissionStatusRecordToDto({
        ...submissionRecord,
        submissionStatus: SubmissionStatus.COMPLETE
      });

    } else {
      return submissionStatusRecordToDto(submissionRecord);
    }
  }

  async cancel(address: string) {
    await this.submissionDbService.findOneAndUpdate({
      paymentAddress: address
    }, {
      submissionStatus: SubmissionStatus.CANCELLED
    }, identity);
  }

  async createSubmission(
    submission: SubmissionDto
  ): Promise<SubmissionStatusDto> {
    const identity: UserIdentity = {
      type: 'anonymous'
    };

    const totalCustomerHoldings = submission.customerHoldings.reduce(
      (amount, holding) => {
        return amount + holding.amount;
      }, 0);

    const paymentAmount = totalCustomerHoldings * this.apiConfigService.paymentPercentage;

    const submissionRecord = await this.submissionDbService.findOneAndUpdate(
      {
        submissionStatus: SubmissionStatus.UNUSED
      },
      {
        submissionStatus: SubmissionStatus.WAITING_FOR_PAYMENT,
        paymentAmount: paymentAmount,
        exchangeName: submission.exchangeName
      },
      identity
    );

    const inserts: CustomerHoldingBase[] =
      submission.customerHoldings.map((holding) => ({
        hashedEmail: holding.hashedEmail,
        amount: holding.amount,
        submissionAddress: submissionRecord.paymentAddress
      }));

    await this.customerHoldingsDbService.insertMany(inserts, identity);

    return {
      paymentAddress: submissionRecord.paymentAddress,
      paymentAmount: paymentAmount,
      submissionStatus: SubmissionStatus.WAITING_FOR_PAYMENT,
      exchangeName: submission.exchangeName
    };
  }


}
