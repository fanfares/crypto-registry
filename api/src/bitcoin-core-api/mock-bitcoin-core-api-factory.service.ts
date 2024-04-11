import { Injectable } from '@nestjs/common';
import { BitcoinCoreApiFactory } from './bitcoin-core-api-factory.service';
import { BitCoinCoreApi } from './bitcoin-core-api';
import { MockBitcoinCoreApi } from './mock-bitcoin-core-api';

@Injectable()
export class MockBitcoinCoreApiFactory extends BitcoinCoreApiFactory {
  api = new MockBitcoinCoreApi();

  getApi(): BitCoinCoreApi {
    return this.api;
  }
}
