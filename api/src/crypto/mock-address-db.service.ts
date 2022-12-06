import { DbApi, MongoService } from '../db';
import { MockAddressBase, MockAddressRecord } from './mock-address.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockAddressDbService extends DbApi<
  MockAddressBase,
  MockAddressRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'mock-addresses');
  }
}
