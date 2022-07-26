import { FilterQuery } from 'mongodb';
import { DbInterceptor } from './db-interceptor';
import { stringifyRecord, stringifyFilter } from './stringify-records';

export class StringifyDbInterceptor<BaseT, RecordT> extends DbInterceptor<BaseT, RecordT> {
  processRecord(record: RecordT): RecordT {
    return stringifyRecord(record);
  }

  processFilter(filter: FilterQuery<RecordT>): FilterQuery<RecordT> {
    return stringifyFilter(filter);
  }
}
