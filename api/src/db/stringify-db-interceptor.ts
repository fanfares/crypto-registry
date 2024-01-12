import { Filter } from 'mongodb';
import { DbInterceptor } from './db-interceptor';
import { stringifyFilter, stringifyRecord } from './stringify-records';

export class StringifyDbInterceptor extends DbInterceptor {
  processRecord(record: object): object {
    return stringifyRecord(record);
  }

  processFilter(filter: Filter<object>): Filter<object> {
    return stringifyFilter(filter);
  }
}
