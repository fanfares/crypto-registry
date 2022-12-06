import { Injectable } from '@nestjs/common';
import { DbApi, MongoService } from '../db';
import { ExchangeBase, ExchangeRecord } from '@bcr/types';

@Injectable()
export class ExchangeDbService extends DbApi<ExchangeBase, ExchangeRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'exchanges');
  }
}
