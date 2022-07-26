import { Injectable } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { CustodianBase, CustodianRecord } from '@bcr/types';
import { DbApi } from './db-api';

@Injectable()
export class CustodianService extends DbApi<CustodianBase, CustodianRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'custodian');
  }
}
