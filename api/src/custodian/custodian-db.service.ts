import { Injectable, Logger } from '@nestjs/common';
import { DbApi } from '../db/db-api';
import { CustodianBase, CustodianRecord } from '@bcr/types';
import { MongoService } from '../db/mongo.service';

@Injectable()
export class CustodianDbService extends DbApi<CustodianBase, CustodianRecord> {

  constructor(
    mongoService: MongoService
  ) {
    super(mongoService, 'custodians', new Logger(CustodianDbService.name));
  }
}
