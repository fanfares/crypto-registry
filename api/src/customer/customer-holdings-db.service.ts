import { Injectable } from '@nestjs/common';
import { DbApi } from '../db/db-api';
import { MongoService } from '../db/mongo.service';
import { CustomerHoldingBase, CustomerHoldingRecord } from '@bcr/types';

@Injectable()
export class CustomerHoldingsDbService extends DbApi<
  CustomerHoldingBase,
  CustomerHoldingRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'customer-holdings');
  }
}
