import { Filter } from 'mongodb';

export class DbInterceptor {
  processRecordArray(records: object[]): object[] {
    return records.map(record => this.processRecord(record));
  }

  processBaseArray(baseArray: object[]): object[] {
    return baseArray.map(baseData => this.processBase(baseData));
  }

  processRecord(record: object): object {
    return record;
  }

  processBase(base: object): object {
    return base;
  }

  processFilter(filter: Filter<any>): Filter<any> {
    return filter;
  }
}
