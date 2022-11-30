import { FilterQuery } from 'mongodb';

export class DbInterceptor<BaseT, RecordT> {
  processRecordArray(records: RecordT[]): RecordT[] {
    return records.map((record) => this.processRecord(record));
  }

  processBaseArray(baseArray: BaseT[]): BaseT[] {
    return baseArray.map((baseData) => this.processBase(baseData));
  }

  processRecord(record: RecordT): RecordT {
    return record;
  }

  processBase(base: BaseT): BaseT {
    return base;
  }

  processFilter(filter: FilterQuery<RecordT>): FilterQuery<RecordT> {
    return filter;
  }
}
