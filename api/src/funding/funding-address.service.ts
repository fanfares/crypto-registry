import {
  CreateFundingAddressDto,
  FundingAddressBase,
  FundingAddressQueryDto,
  FundingAddressQueryResultDto,
  Network,
  UserRecord
} from '@bcr/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Bip84Utils } from '../crypto';
import { getUniqueIds } from '../utils';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';
import { FundingAddressRecord, FundingAddressStatus } from '../types/funding-address.type';
import { BulkUpdate } from '../db/db-api.types';
import { ExchangeService } from '../exchange/exchange.service';
import { Filter } from 'mongodb';

@Injectable()
export class FundingAddressService {

  private readonly logger = new Logger(FundingAddressService.name);

  constructor(
    protected bitcoinServiceFactory: BitcoinServiceFactory,
    protected bitcoinCoreServiceFactory: BitcoinCoreApiFactory,
    protected apiConfigService: ApiConfigService,
    protected db: DbService,
    protected exchangeService: ExchangeService
  ) {
  }

  async processAddressBatch(
    exchangeId: string,
    network: Network,
    pendingAddresses: FundingAddressRecord[]
  ) {
    const start = new Date();
    this.logger.log(`processing ${network} batch for exchange: ${exchangeId}, first address: ${pendingAddresses[0]._id}`);
    const activeAddresses = await this.db.fundingAddresses.find({
      exchangeId: exchangeId,
      status: FundingAddressStatus.ACTIVE,
      address: {$in: pendingAddresses.map(a => a.address)}
    });

    const bitcoinService = this.bitcoinServiceFactory.getService(network);
    if (!bitcoinService) {
      throw new BadRequestException('Node is not configured for network ' + network);
    }

    const dateMap = await this.getMessageDateMap(network, pendingAddresses);
    const addressUpdates: BulkUpdate<FundingAddressBase>[] = [];
    const balancesMap = await bitcoinService.getAddressBalances(pendingAddresses.map(a => a.address));
    for (const pendingAddress of pendingAddresses) {
      const balance = balancesMap.get(pendingAddress.address);
      try {
        addressUpdates.push({
          id: pendingAddress._id,
          modifier: {
            balance: balance,
            validFromDate: dateMap.get(pendingAddress.message),
            status: FundingAddressStatus.ACTIVE
          }
        });

        const activeAddress = activeAddresses.find(
          activeAddress => activeAddress.address === pendingAddress.address && pendingAddress);

        if (activeAddress) {
          addressUpdates.push({
            id: activeAddress._id,
            modifier: {
              status: FundingAddressStatus.CANCELLED
            }
          });
        }
      } catch (err) {
        this.logger.error(`Failed to process ${network} address: ` + pendingAddress.address);
        addressUpdates.push({
          id: pendingAddress._id,
          modifier: {
            status: FundingAddressStatus.FAILED,
            failureMessage: err.message
          }
        });
      }
    }

    await this.db.fundingAddresses.bulkUpdate(addressUpdates);

    const elapsed = (new Date().getTime() - start.getTime()) / 1000;
    this.logger.log(`${network} batch processing completed ${elapsed} s`,);

  }

  private async getMessageDateMap(
    network: Network,
    addresses: FundingAddressRecord[]
  ) {
    const bitcoinCoreService = this.bitcoinCoreServiceFactory.getApi(network);
    const uniqueBlockHashes = getUniqueIds('message', addresses);
    const dateMap = new Map<string, Date>();
    for (const message of uniqueBlockHashes) {
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
    addresses: CreateFundingAddressDto[]
  ): boolean {
    for (const address of addresses) {

      let result = true;
      try {
        result = Bip84Utils.verify({
          signature: address.signature,
          address: address.address,
          message: address.message
        });
      } catch (err) {
        throw new BadRequestException('Corrupt signature on ' + address.address);
      }

      if (result === false) {
        throw new BadRequestException('Invalid signature on ' + address.address);
      }
    }

    return true;
  }

  async validateAddressNetwork(
    newAddresses: CreateFundingAddressDto[],
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

  async query(
    user: UserRecord,
    query: FundingAddressQueryDto
  ): Promise<FundingAddressQueryResultDto> {

    if (query.pageSize > 100) {
      throw new BadRequestException('Max page size is 100');
    }

    let exchangeId = query.exchangeId;
    if (user.exchangeId) {
      exchangeId = user.exchangeId;
    }

    if (!exchangeId) {
      throw new BadRequestException('Specify exchangeId for funding address query');
    }

    const filter: Filter<FundingAddressRecord> = {
      exchangeId: exchangeId
    };

    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = {$ne: FundingAddressStatus.CANCELLED};
    }

    if (query.address) {
      filter.address = {$regex: new RegExp(query.address, 'i')};
    }

    const addressPage = await this.db.fundingAddresses.find(filter, {
      limit: query.pageSize,
      offset: query.pageSize * (query.page - 1)
    });

    const total = await this.db.fundingAddresses.count({
      exchangeId: exchangeId,
      status: {$ne: FundingAddressStatus.CANCELLED}
    });

    return {
      addresses: addressPage,
      total: total
    };
  }

  async deleteAddress(
    user: UserRecord,
    address: string
  ) {
    await this.db.fundingAddresses.updateMany({
      address: address,
      exchangeId: user.exchangeId
    }, {
      status: FundingAddressStatus.CANCELLED
    });

    await this.exchangeService.updateStatus(user.exchangeId);
  }
}
