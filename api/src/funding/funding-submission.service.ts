import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import {
  CreateFundingSubmissionDto,
  FundingAddressBase,
  FundingSubmissionDto,
  Network
} from '@bcr/types';
import { DbService } from '../db/db.service';
import { FundingAddressService } from './funding-address.service';
import { ExchangeService } from '../exchange/exchange.service';
import { getFundingSubmissionDto } from './get-funding-submission-dto';
import { FundingAddressStatus } from '../types/funding-address.type';
import { resetExchangeFunding } from './reset-exchange-funding';
import { v4 as uuid } from 'uuid';
import { requestContext } from '../utils/logging/request-context';
import { getUniqueIds } from '../utils';

@Injectable()
export class FundingSubmissionService {
  private logger = new Logger(FundingSubmissionService.name);
  private isProcessing: boolean;

  constructor(
    protected db: DbService,
    protected apiConfigService: ApiConfigService,
    protected fundingAddressService: FundingAddressService,
    protected exchangeService: ExchangeService
  ) {
  }

  async executionCycle() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      requestContext.setContext(uuid());
      await this.processAddresses(Network.mainnet);
      await this.processAddresses(Network.testnet);
    } catch (err) {
      this.logger.error('failed to get submission status:' + err.message, {err});
    }
    this.isProcessing = false;
  }

  async getSubmissionDto(
    submissionId: string
  ): Promise<FundingSubmissionDto> {
    return getFundingSubmissionDto(submissionId, this.db);
  }

  // todo - move to exchange controller?
  async cancelPending(exchangeId: string) {
    await this.db.fundingAddresses.updateMany({
      exchangeId: exchangeId,
      status: FundingAddressStatus.PENDING
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
      exchangeId: exchangeId
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
    network: Network
  ) {
    try {
      const startDate = new Date();
      const batchSize = 100

      let pendingAddresses = await this.db.fundingAddresses.find({
        status: FundingAddressStatus.PENDING,
        network: network
      }, {
        limit: batchSize,
        sort: {
          createdDate: 1
        }
      });

      if (pendingAddresses.length === 0) {
        return;
      }

      this.logger.log(`processing ${network} submission addresses`);
      const submissionIds = getUniqueIds('fundingSubmissionId', pendingAddresses);
      while (pendingAddresses.length > 0) {
        const uniqueExchangeIds = getUniqueIds('exchangeId', pendingAddresses);
        for (const exchangeId of uniqueExchangeIds) {
          await this.fundingAddressService.processAddressBatch(exchangeId, network, pendingAddresses);
          pendingAddresses = await this.db.fundingAddresses.find({
            status: FundingAddressStatus.PENDING,
            exchangeId: exchangeId,
            network: network
          }, {
            limit: batchSize
          });
        }
      }

      const elapsed = (new Date().getTime() - startDate.getTime()) / 1000;
      this.logger.log(`${network} submission processing completed in ${elapsed} s`, {
        submissionIds
      });

      const submissions = await this.db.fundingSubmissions.find({
        _id: {$in: submissionIds}
      });
      const exchangeIds = getUniqueIds('exchangeId', submissions);
      for (const exchangeId of exchangeIds) {
        await this.exchangeService.updateStatus(exchangeId);
      }
    } catch (err) {
      this.logger.error(`processing ${network} submission addresses failed: ${err.message}`);
    }
  }

}
