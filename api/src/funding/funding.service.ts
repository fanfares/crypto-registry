import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateFundingSubmissionDto, FundingAddressBase, Network } from '@bcr/types';
import { DbService } from '../db/db.service';
import { FundingAddressService } from './funding-address.service';
import { ExchangeService } from '../exchange/exchange.service';
import {FundingAddressStatus } from '../types/funding-address.type';
import { resetExchangeFunding } from './reset-exchange-funding';
import { v4 as uuid } from 'uuid';
import { requestContext } from '../utils/logging/request-context';
import { BulkUpdate } from '../db/db-api.types';

@Injectable()
export class FundingService {
  private logger = new Logger(FundingService.name);
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
  ): Promise<void> {
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
    const existingAddresses = await this.db.fundingAddresses.find({exchangeId});
    const updates: BulkUpdate<FundingAddressBase>[] = [];
    const inserts: FundingAddressBase[] = [];

    for (const address of submission.addresses) {
      const existingAddress = existingAddresses.find(a => a.address === address.address );
      if (existingAddress) {
        updates.push({
          id: existingAddress._id,
          modifier: {
            status: FundingAddressStatus.PENDING,
            retryCount: 0
          }
        })
      } else {
        inserts.push({
          address: address.address,
          signature: address.signature,
          message: address.message,
          exchangeId: exchangeId,
          status: FundingAddressStatus.PENDING,
          network: network,
          retryCount: 0
        });
      }
    }

    if ( updates.length ) {
      await this.db.fundingAddresses.bulkUpdate(updates)
    }
    if (inserts.length ) {
      await this.db.fundingAddresses.insertMany(inserts, this.logger);
    }
  }

  protected async processAddresses(
    network: Network
  ) {
    try {
      const startDate = new Date();
      const batchSize = 100;

      let pendingAddresses = await this.db.fundingAddresses.find({
        status: FundingAddressStatus.PENDING,
        network: network
      }, {
        limit: batchSize,
        sort: {
          exchangeId: 1,
          createdDate: 1,
        }
      });

      this.logger.log(`processing ${pendingAddresses.length} ${network} addresses`);
      while (pendingAddresses.length > 0) {
          await this.fundingAddressService.processAddressBatch(network, pendingAddresses);
          pendingAddresses = await this.db.fundingAddresses.find({
            status: FundingAddressStatus.PENDING,
            network: network
          }, {
            sort: {
              exchangeId: 1,
            },
            limit: batchSize
          });
      }

      const elapsed = (new Date().getTime() - startDate.getTime()) / 1000;
      this.logger.log(`${network} funding cycle completed in ${elapsed} s`);

    } catch (err) {
      this.logger.error(`processing ${network} submission addresses failed: ${err.message}`);
    }
  }

  async refreshExchangeBalances(
    exchangeId: string
  ): Promise<void> {
    await this.db.fundingAddresses.updateMany({exchangeId}, {
      status: FundingAddressStatus.PENDING,
      retryCount: 0
    });
    await this.executionCycle();
  }

  async refreshAllBalances(
  ): Promise<void> {
    this.logger.log('Refresh All Balances - Setting to Pending');
    await this.db.fundingAddresses.updateMany({}, {
      status: FundingAddressStatus.PENDING,
      retryCount: 0
    });
  }

}
