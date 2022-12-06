import { Injectable } from '@nestjs/common';
import { DbApi } from '../db/db-api';
import { ExchangeBase, ExchangeRecord } from '@bcr/types';
import { MongoService } from '../db/mongo.service';

@Injectable()
export class ExchangeDbService extends DbApi<ExchangeBase, ExchangeRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'exchanges');
  }
}
