import { DbApi } from '../db/db-api';
import { MockAddressBase, MockAddressRecord } from './mock-address.types';
import { MongoService } from '../db/mongo.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockAddressDbService extends DbApi<
  MockAddressBase,
  MockAddressRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'mock-addresses');
  }
}
