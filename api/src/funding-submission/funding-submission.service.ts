import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import {
  CreateRegisteredAddressDto,
  FundingAddressBase,
  FundingSubmissionDto,
  FundingSubmissionStatus
} from '@bcr/types';
import { DbService } from '../db/db.service';
import { FundingAddressService } from './funding-address.service';
import { ExchangeService } from '../exchange/exchange.service';
import { getFundingSubmissionDto } from './get-funding-submission-dto';
import { Bip84Utils } from '../crypto';

@Injectable()
export class FundingSubmissionService {

  constructor(
    protected db: DbService,
    protected apiConfigService: ApiConfigService,
    protected logger: Logger,
    protected registeredAddressService: FundingAddressService,
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
      status: FundingSubmissionStatus.WAITING_FOR_PROCESSING
    });

    for (const submission of submissions) {
      this.logger.log('process funding submission', {addressSubmission: submission});
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
    await this.updateStatus(submissionId, FundingSubmissionStatus.CANCELLED);
  }

  async cancel(submissionId: string) {
    await this.updateStatus(submissionId, FundingSubmissionStatus.CANCELLED);
  }

  async createSubmission(
    exchangeId: string,
    addresses: CreateRegisteredAddressDto[],
    signingMessage: string
  ): Promise<string> {
    this.logger.log('create funding submission:', {exchangeId, addresses, signingMessage});

    if (addresses.length === 0) {
      throw new BadRequestException('No addresses in submission');
    }

    // Cancel existing pending submissions
    await this.db.fundingSubmissions.updateMany({
      exchangeId: exchangeId,
      status: {$in: [FundingSubmissionStatus.PROCESSING, FundingSubmissionStatus.WAITING_FOR_PROCESSING]}
    }, {
      status: FundingSubmissionStatus.CANCELLED
    });

    let valid: boolean;
    try {
      valid = this.registeredAddressService.validateSignatures(addresses, signingMessage);
    } catch (err) {
      throw new BadRequestException('Invalid submission - Could not validate signatures');
    }

    // todo - get the user's public key.
    const network = Bip84Utils.getNetworkForAddress(addresses[0].address);

    addresses.forEach(address => {
      if (Bip84Utils.getNetworkForAddress(address.address) !== network) {
        throw new BadRequestException('Cannot combine testnet and mainnet addresses in single funding submission');
      }
    });

    const submissionId = await this.db.fundingSubmissions.insert({
      network: network,
      totalFunds: null,
      status: valid ? FundingSubmissionStatus.WAITING_FOR_PROCESSING : FundingSubmissionStatus.INVALID_SIGNATURES,
      exchangeId: exchangeId,
      isCurrent: false,
      signingMessage: signingMessage
    });

    const fundingAddresses: FundingAddressBase[] = addresses.map(address => ({
      ...address,
      fundingSubmissionId: submissionId,
      validFromDate: null,
      balance: null
    }));

    await this.db.fundingAddresses.insertMany(fundingAddresses, this.logger);

    return submissionId;
  }

  protected async processAddresses(
    addressSubmissionId: string
  ) {
    this.logger.log('Retrieve wallet balance, submission: ' + addressSubmissionId);
    try {
      await this.registeredAddressService.processAddresses(addressSubmissionId);
      const submission = await this.db.fundingSubmissions.get(addressSubmissionId);
      await this.exchangeService.updateStatus(submission.exchangeId);
    } catch (err) {
      await this.processingFailed(addressSubmissionId, err.message);
    }
  }

}
