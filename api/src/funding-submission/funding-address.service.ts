import { CreateRegisteredAddressDto, FundingAddressBase, FundingSubmissionStatus, Network } from '@bcr/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Bip84Utils } from '../crypto';
import { getUniqueIds } from '../utils';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';
import { FundingAddressRecord } from '../types/funding-address.type';
import { BulkUpdate } from '../db/db-api.types';

@Injectable()
export class FundingAddressService {
  constructor(
    protected bitcoinServiceFactory: BitcoinServiceFactory,
    protected bitcoinCoreServiceFactory: BitcoinCoreApiFactory,
    protected apiConfigService: ApiConfigService,
    protected logger: Logger,
    protected db: DbService
  ) {
  }

  async processAddresses(fundingSubmissionId: string) {

    await this.db.fundingSubmissions.update(fundingSubmissionId, {
      status: FundingSubmissionStatus.PROCESSING
    });

    const submission = await this.db.fundingSubmissions.get(fundingSubmissionId);
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    if (!bitcoinService) {
      throw new BadRequestException('Node is not configured for network ' + submission.network);
    }

    const addresses = await this.db.fundingAddresses.find({
      fundingSubmissionId: fundingSubmissionId
    });

    const dateMap = await this.getMessageDateMap(submission.network, addresses);
    const addressUpdates: BulkUpdate<FundingAddressBase>[] = [];
    await bitcoinService.testService();
    let totalBalance = 0;
    for (const address of addresses) {
      const balance = await bitcoinService.getAddressBalance(address.address);
      totalBalance += balance;
      addressUpdates.push({
        id: address._id,
        modifier: {
          balance: balance,
          validFromDate: dateMap.get(address.message)
        }
      });
    }
    await this.db.fundingAddresses.bulkUpdate(addressUpdates);

    this.logger.log('processing funding submission:' + fundingSubmissionId );

    // Shift the isCurrent flag to the latest submission
    await this.db.fundingSubmissions.updateMany({
      isCurrent: true,
      exchangeId: submission.exchangeId,
      network: submission.network
    }, {
      isCurrent: false
    });

    await this.db.fundingSubmissions.update(submission._id, {
      totalFunds: totalBalance,
      isCurrent: true,
      status: FundingSubmissionStatus.ACCEPTED
    });
  }

  private async getMessageDateMap(
    network: Network,
    addresses: FundingAddressRecord[]
  ) {
    const bitcoinCoreService = this.bitcoinCoreServiceFactory.getApi(network);
    const messages = getUniqueIds('message', addresses);
    const dateMap = new Map<string, Date>();
    for (const message of messages) {
      if (!dateMap.has(message)) {
        const block = await bitcoinCoreService.getBlockDetail(message);
        if (!block) {
          throw new BadRequestException('Invalid message block:' + message);
        } else {
          dateMap.set(message, block.time);
        }
      }
    }
    return dateMap;
  }

  validateSignatures(
    addresses: CreateRegisteredAddressDto[]
  ): boolean {
    for (const address of addresses) {
      if (!Bip84Utils.verify({
        signature: address.signature,
        address: address.address,
        message: address.message
      })) {
        return false;
      }
    }
    return true;
  }


}
