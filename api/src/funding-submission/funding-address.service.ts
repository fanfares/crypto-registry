import { CreateRegisteredAddressDto, FundingAddressBase, FundingSubmissionStatus, Network } from '@bcr/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Bip84Utils } from '../crypto';
import { getUniqueIds } from '../utils';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';
import { FundingAddressRecord, FundingAddressStatus } from '../types/funding-address.type';
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

    const pendingAddresses = await this.db.fundingAddresses.find({
      fundingSubmissionId: fundingSubmissionId
    });

    const activeAddresses = await this.db.fundingAddresses.find({
      exchangeId: submission.exchangeId,
      status: FundingAddressStatus.ACTIVE,
      fundingSubmissionId: { $ne: fundingSubmissionId }
    });

    const dateMap = await this.getMessageDateMap(submission.network, pendingAddresses);
    const addressUpdates: BulkUpdate<FundingAddressBase>[] = [];
    await bitcoinService.testService();
    let submissionBalance = 0;
    for (const pendingAddress of pendingAddresses) {
      const balance = await bitcoinService.getAddressBalance(pendingAddress.address);
      submissionBalance += balance;
      addressUpdates.push({
        id: pendingAddress._id,
        modifier: {
          balance: balance,
          validFromDate: dateMap.get(pendingAddress.message),
          status: FundingAddressStatus.ACTIVE
        }
      });

      const activeAddress = activeAddresses.find(
        activeAddress => activeAddress.address === pendingAddress.address);

      if (activeAddress) {
        addressUpdates.push({
          id: activeAddress._id,
          modifier: {
            status: FundingAddressStatus.CANCELLED
          }
        });
      }
    }

    await this.db.fundingAddresses.bulkUpdate(addressUpdates);
    this.logger.log('processing funding submission:' + fundingSubmissionId);
    await this.db.fundingSubmissions.update(submission._id, {
      status: FundingSubmissionStatus.ACCEPTED,
      submissionFunds: submissionBalance
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
    try {
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
    } catch (err) {
      throw new BadRequestException('Invalid submission - Could not validate signatures');
    }
  }

  async validateAddressNetwork(
    newAddresses: CreateRegisteredAddressDto[],
    exchangeId: string
  ) {
    const network = Bip84Utils.getNetworkForAddress(newAddresses[0].address);

    newAddresses.forEach(address => {
      if (Bip84Utils.getNetworkForAddress(address.address) !== network) {
        throw new BadRequestException('Cannot combine testnet and mainnet addresses in one submission');
      }
    });

    const existingAddress = await this.db.fundingAddresses.find({
      exchangeId: exchangeId,
      status: {$ne: FundingAddressStatus.CANCELLED}
    });

    existingAddress.forEach(address => {
      if (Bip84Utils.getNetworkForAddress(address.address) !== network) {
        throw new BadRequestException('Cannot combine testnet and mainnet in one exchange concurrently');
      }
    });
    return network;
  }
}
