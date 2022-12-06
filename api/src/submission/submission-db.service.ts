import { DbApi, MongoService } from '../db';
import { Injectable } from '@nestjs/common';
import { SubmissionBase, SubmissionRecord } from '@bcr/types';

@Injectable()
export class SubmissionDbService extends DbApi<SubmissionBase, SubmissionRecord> {
  constructor(mongoService: MongoService) {
    super(mongoService, 'submissions');
  }
}
