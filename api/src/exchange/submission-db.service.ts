import { DbApi } from '../db/db-api';
import { Injectable } from '@nestjs/common';
import { MongoService } from '../db/mongo.service';
import { SubmissionBase, SubmissionRecord } from '../types/submission-db.types';


@Injectable()
export class SubmissionDbService extends DbApi<SubmissionBase, SubmissionRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'submissions');
  }
}
