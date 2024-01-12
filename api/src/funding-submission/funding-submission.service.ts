import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateRegisteredAddressDto, FundingSubmissionDto, FundingSubmissionStatus } from '@bcr/types';
import { DbService } from '../db/db.service';
import { EventGateway } from '../event-gateway';
import { RegisteredAddressService } from './registered-address.service';
import { ExchangeService } from '../exchange/exchange.service';
import { fundingSubmissionStatusRecordToDto } from './funding-submission-record-to-dto';
import { Bip84Utils } from '../crypto/bip84-utils';

@Injectable()
export class FundingSubmissionService {

  constructor(
    protected db: DbService,
    protected apiConfigService: ApiConfigService,
    protected logger: Logger,
    protected eventGateway: EventGateway,
    protected registeredAddressService: RegisteredAddressService,
    protected exchangeService: ExchangeService
  ) {
  }

  private async processingFailed(submissionId: string, errorMessage: string) {
    this.logger.error(errorMessage);
    await this.db.fundingSubmissions.update(submissionId, {
      status: FundingSubmissionStatus.RETRIEVING_BALANCES_FAILED,
      errorMessage: errorMessage
    });
    await this.emitFundingSubmission(submissionId);
  }

  private async updateStatus(
    submissionId: string,
    status: FundingSubmissionStatus
  ) {
    const modifier: any = {status};
    await this.db.fundingSubmissions.update(submissionId, modifier);
    await this.emitFundingSubmission(submissionId);
  }

  protected async emitFundingSubmission(submissionId: string) {
    const submission = await this.db.fundingSubmissions.get(submissionId);
    const submissionDto = fundingSubmissionStatusRecordToDto(submission);
    this.eventGateway.emitFundingSubmissionUpdates(submissionDto);
  }

  async executionCycle() {
    this.logger.log('funding submissions cycle');

    const submissions = await this.db.fundingSubmissions.find({
      status: FundingSubmissionStatus.RETRIEVING_BALANCES
    });

    for (const submission of submissions) {
      this.logger.log('process funding submission', {addressSubmission: submission});
      try {
        await this.retrieveWalletBalance(submission._id);
      } catch (err) {
        this.logger.error('failed to get submission status:' + err.message, {err});
      }
    }
    this.logger.log('funding submissions cycle complete');
  }

  async getSubmissionDto(
    submissionId: string
  ): Promise<FundingSubmissionDto> {
    const submission = await this.db.fundingSubmissions.get(submissionId);
    return fundingSubmissionStatusRecordToDto(submission);
  }

  async processCancellation(submissionId: string) {
    await this.updateStatus(submissionId, FundingSubmissionStatus.CANCELLED);
    await this.emitFundingSubmission(submissionId);
  }

  async cancel(submissionId: string) {
    await this.updateStatus(submissionId, FundingSubmissionStatus.CANCELLED);
    await this.emitFundingSubmission(submissionId);
  }

  async createSubmission(
    exchangeId: string,
    addresses: CreateRegisteredAddressDto[],
    signingMessage: string
  ): Promise<string> {
    this.logger.log('create address submission:' + {exchangeId, addresses, signingMessage});

    const valid = this.registeredAddressService.validateSignatures(addresses, signingMessage);
    const network = Bip84Utils.getNetworkForAddress(addresses[0].address);

    addresses.forEach(address => {
      if (Bip84Utils.getNetworkForAddress(address.address) !== network) {
        throw new BadRequestException('Cannot combine testnet and mainnet addresses in single funding submission');
      }
    });

    const submissionId = await this.db.fundingSubmissions.insert({
      network: network,
      addresses: addresses.map(a => ({...a, balance: null})),
      totalFunds: null,
      status: valid ? FundingSubmissionStatus.RETRIEVING_BALANCES : FundingSubmissionStatus.INVALID_SIGNATURES,
      exchangeId: exchangeId,
      isCurrent: false,
      signingMessage: signingMessage
    });

    await this.emitFundingSubmission(submissionId);
    return submissionId;
  }

  protected async retrieveWalletBalance(
    addressSubmissionId: string
  ) {
    this.logger.log('Retrieve wallet balance, submission: ' + addressSubmissionId);
    try {
      await this.registeredAddressService.retrieveBalances(addressSubmissionId);
      const submission = await this.db.fundingSubmissions.get(addressSubmissionId);
      await this.exchangeService.updateStatus(submission.exchangeId);
    } catch (err) {
      await this.processingFailed(addressSubmissionId, err.message);
    }
    await this.emitFundingSubmission(addressSubmissionId);
  }

}
