import { Injectable } from "@nestjs/common";
import { BitcoinCoreApiFactory } from "./bitcoin-core-api-factory.service";
import { BitCoinCoreApi } from './bitcoin-core-api';
import { Network } from '@bcr/types';
import { MockBitcoinCoreApi } from './mock-bitcoin-core-api';

@Injectable()
export class MockBitcoinCoreApiFactory extends BitcoinCoreApiFactory {
  api = new MockBitcoinCoreApi(null)

  getApi(): BitCoinCoreApi {
    return this.api;
  }
}
