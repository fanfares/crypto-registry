import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import {
  CreateFundingSubmissionDto,
  FundingAddressBase,
  FundingSubmissionDto,
  FundingSubmissionStatus
} from '@bcr/types';
import { DbService } from '../db/db.service';
import { FundingAddressService } from './funding-address.service';
import { ExchangeService } from '../exchange/exchange.service';
import { getFundingSubmissionDto } from './get-funding-submission-dto';
import { FundingAddressStatus } from '../types/funding-address.type';
import { resetExchangeFunding } from './reset-exchange-funding';

@Injectable()
export class FundingSubmissionService {

  constructor(
    protected db: DbService,
    protected apiConfigService: ApiConfigService,
    protected logger: Logger,
    protected fundingAddressService: FundingAddressService,
    protected exchangeService: ExchangeService
  ) {
  }

  private async processingFailed(submissionId: string, errorMessage: string) {
    this.logger.error(errorMessage);
    await this.db.fundingSubmissions.update(submissionId, {
      status: FundingSubmissionStatus.FAILED,
      errorMessage: errorMessage
    });
  }

  private async updateStatus(
    submissionId: string,
    status: FundingSubmissionStatus
  ) {
    const modifier: any = {status};
    await this.db.fundingSubmissions.update(submissionId, modifier);
  }

  async executionCycle() {
    this.logger.log('funding submissions cycle');

    const submissions = await this.db.fundingSubmissions.find({
      status: FundingSubmissionStatus.PENDING
    });

    for (const submission of submissions) {
      this.logger.log('process funding submission', {id: submission._id});
      try {
        await this.processAddresses(submission._id);
      } catch (err) {
        this.logger.error('failed to get submission status:' + err.message, {err});
      }
    }
    this.logger.log('funding submissions cycle complete');
  }

  async getSubmissionDto(
    submissionId: string
  ): Promise<FundingSubmissionDto> {
    return getFundingSubmissionDto(submissionId, this.db);
  }

  async processCancellation(submissionId: string) {
    // await this.cancel(submissionId);
  }

  async cancelPending(exchangeId: string) {
    const pendingSubmissions = await this.db.fundingSubmissions.find({
      exchangeId: exchangeId,
      status: FundingSubmissionStatus.PENDING
    });

    await this.db.fundingSubmissions.updateMany({
      exchangeId: exchangeId,
      _id: { $in: pendingSubmissions.map(p => p._id)}
    }, {
      status: FundingSubmissionStatus.CANCELLED
    });

    await this.db.fundingAddresses.updateMany({
      exchangeId: exchangeId,
      submissionId: { $in: pendingSubmissions.map(p => p._id)}
    }, {
      status: FundingAddressStatus.CANCELLED
    });

    await this.exchangeService.updateStatus(exchangeId);
  }

  async createSubmission(
    exchangeId: string,
    submission: CreateFundingSubmissionDto
  ): Promise<string> {
    this.logger.log('create funding submission:', {exchangeId});

    if (submission.addresses.length === 0) {
      throw new BadRequestException('No addresses in submission');
    }

    if (submission.resetFunding) {
      await resetExchangeFunding(exchangeId, this.db);
    }

    // Both these validations will throw exceptions if the validation fails for any addresses
    this.fundingAddressService.validateSignatures(submission.addresses);
    const network = await this.fundingAddressService.validateAddressNetwork(submission.addresses, exchangeId);

    const submissionId = await this.db.fundingSubmissions.insert({
      network: network,
      status: FundingSubmissionStatus.PENDING,
      exchangeId: exchangeId,
      submissionFunds: null
    });

    const fundingAddresses: FundingAddressBase[] = submission.addresses.map(address => ({
      address: address.address,
      signature: address.signature,
      message: address.message,
      fundingSubmissionId: submissionId,
      validFromDate: null,
      balance: null,
      exchangeId: exchangeId,
      status: FundingAddressStatus.PENDING,
      network: network
    }));

    await this.db.fundingAddresses.insertMany(fundingAddresses, this.logger);

    return submissionId;
  }

  protected async processAddresses(
    fundingSubmissionId: string
  ) {
    this.logger.log('Retrieve wallet balance, submission: ' + fundingSubmissionId);
    try {

      await this.db.fundingSubmissions.update(fundingSubmissionId, {
        status: FundingSubmissionStatus.PROCESSING
      });

      const submission = await this.db.fundingSubmissions.get(fundingSubmissionId);

      let pendingAddresses = await this.db.fundingAddresses.find({
        fundingSubmissionId: fundingSubmissionId,
        status: FundingAddressStatus.PENDING
      }, {
        limit: 100
      });

      const startDate = new Date();

      let submissionBalance = 0;
      while ( pendingAddresses.length > 0 ) {
        this.logger.log('processing batch of addresses:' + fundingSubmissionId );
        submissionBalance += await this.fundingAddressService.processAddresses(submission.exchangeId, submission.network, pendingAddresses);
        pendingAddresses = await this.db.fundingAddresses.find({
          fundingSubmissionId: fundingSubmissionId,
          status: FundingAddressStatus.PENDING
        }, {
          limit: 100
        });
      }

      await this.db.fundingSubmissions.update(submission._id, {
        status: FundingSubmissionStatus.COMPLETE,
        submissionFunds: submissionBalance
      });

      const elapsed = (new Date().getTime() - startDate.getTime())/1000
      this.logger.log('processing funding submission complete:' + fundingSubmissionId + ' in ' + elapsed + 's');

      await this.exchangeService.updateStatus(submission.exchangeId);
    } catch (err) {
      await this.processingFailed(fundingSubmissionId, err.message);
    }
  }

}
