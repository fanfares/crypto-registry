import { Injectable } from '@nestjs/common';
import { DbApi } from '../db/db-api';
import { MongoService } from '../db/mongo.service';
import { CustomerHoldingBase, CustomerHoldingRecord } from '@bcr/types';

@Injectable()
export class CustomerHoldingService extends DbApi<CustomerHoldingBase, CustomerHoldingRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'custom-holding');
  }
}
