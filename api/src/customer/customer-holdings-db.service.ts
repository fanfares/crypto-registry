import { Injectable } from '@nestjs/common';
import { DbApi, MongoService } from '../db';
import { CustomerHoldingBase, CustomerHoldingRecord } from '@bcr/types';

@Injectable()
export class CustomerHoldingsDbService extends DbApi<CustomerHoldingBase, CustomerHoldingRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'customer-holdings');
  }
}
