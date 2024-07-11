import {
  CreateFundingAddressDto,
  FundingAddressBase,
  FundingAddressQueryDto,
  FundingAddressQueryResultDto,
  Network,
  UserRecord
} from '@bcr/types';
import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Bip84Utils } from '../crypto';
import { getUniqueIds, wait } from '../utils';
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
    network: Network,
    pendingAddresses: FundingAddressRecord[]
  ) {
    const exchangeIds = getUniqueIds('exchangeId', pendingAddresses);

    for (const exchangeId of exchangeIds) {
      const exchange = await this.db.exchanges.get(exchangeId);
      const start = new Date();
      this.logger.log(`processing ${pendingAddresses.length} funding addresses for exchange: ${exchange.name} on ${network}, first address: ${pendingAddresses[0]._id}`);

      const bitcoinService = this.bitcoinServiceFactory.getService(network);

      try {
        const addressUpdates: BulkUpdate<FundingAddressBase>[] = [];
        const dateMap = await this.getMessageDateMap(network, pendingAddresses);
        const balancesMap = await bitcoinService.getAddressBalances(pendingAddresses.map(a => a.address));
        for (const pendingAddress of pendingAddresses) {
          const balance = balancesMap.get(pendingAddress.address);
          addressUpdates.push({
            id: pendingAddress._id,
            modifier: {
              balance: balance,
              signatureDate: dateMap.get(pendingAddress.message),
              balanceDate: start,
              status: FundingAddressStatus.ACTIVE
            }
          });
        }

        await this.db.fundingAddresses.bulkUpdate(addressUpdates);
        const elapsed = (new Date().getTime() - start.getTime()) / 1000;
        await this.exchangeService.updateStatus(exchangeId);
        this.logger.log(`${network} batch processing completed ${elapsed} s`);

      } catch (err) {
        this.logger.error(`failed to process ${exchange.name} ${network} batch: ${err}`);
        await this.handleProcessingFailure(pendingAddresses, err);
      }
    }
  }

  public async handleProcessingFailure(
    pendingAddresses: FundingAddressRecord[],
    failureMessage: string
  ) {

    let failedAddressIds = pendingAddresses.map(p => p._id);
    for (let i = 0; i < 3; i++) {
      const retrySubSetIds = (await this.db.fundingAddresses.find({
        _id: {$in: failedAddressIds},
        retryCount: i,
        status: FundingAddressStatus.PENDING
      })).map(f => f._id);

      if (retrySubSetIds.length > 0) {
        failedAddressIds = failedAddressIds.filter(id => !retrySubSetIds.includes(id));
        await this.db.fundingAddresses.updateMany({
          _id: {$in: retrySubSetIds}
        }, {
          retryCount: i + 1
        });
      }
    }

    await this.db.fundingAddresses.updateMany({
      _id: {$in: pendingAddresses.map(p => p._id)},
      retryCount: {$gte: 3},
      status: FundingAddressStatus.PENDING,
    }, {
      failureMessage: failureMessage,
      status: FundingAddressStatus.FAILED
    });

    await wait(10000);
  }

  private async getMessageDateMap(
    network: Network,
    addresses: FundingAddressRecord[]
  ): Promise<Map<string, Date>> {
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

    const existingAddress = await this.db.fundingAddresses.find({exchangeId});

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
    }

    if (query.address) {
      filter.address = {$regex: new RegExp(query.address, 'i')};
    }

    const addressPage = await this.db.fundingAddresses.find(filter, {
      limit: query.pageSize,
      offset: query.pageSize * (query.page - 1)
    });

    const total = await this.db.fundingAddresses.count({
      exchangeId: exchangeId
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
    await this.db.fundingAddresses.deleteMany({
      address: address,
      exchangeId: user.exchangeId
    });
    await this.exchangeService.updateStatus(user.exchangeId);
  }

  async refreshAddress(
    address: string,
    user: UserRecord
  ) {
    const fundingAddress = await this.db.fundingAddresses.findOne({
      address: address
    });
    if (!user.isSystemAdmin && user.exchangeId !== fundingAddress.exchangeId) {
      throw new ForbiddenException();
    }
    const bitcoinService = this.bitcoinServiceFactory.getService(fundingAddress.network);
    try {
      const balance = await bitcoinService.getAddressBalance(fundingAddress.address);
      await this.db.fundingAddresses.update(fundingAddress._id, {
        status: FundingAddressStatus.ACTIVE,
        balance: balance,
        balanceDate: new Date()
      });
    } catch (err) {
      await this.db.fundingAddresses.update(fundingAddress._id, {
        status: FundingAddressStatus.FAILED,
        balance: 0,
        balanceDate: new Date()
      });
    }

    await this.exchangeService.updateStatus(fundingAddress.exchangeId);
    return await this.db.fundingAddresses.findOne({
      address: address
    });
  }
}
