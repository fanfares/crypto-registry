import { Injectable } from '@nestjs/common';
import { DbApi } from '../db/db-api';
import { CustodianWalletBase, CustodianWalletRecord } from '@bcr/types';
import { MongoService } from '../db/mongo.service';

@Injectable()
export class CustodianWalletService extends DbApi<CustodianWalletBase, CustodianWalletRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'custodian-wallet');
  }
}
