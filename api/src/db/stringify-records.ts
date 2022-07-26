import { ObjectId } from 'mongodb';

export const stringifyRecords = (records: any[]) => {
  return records.map(record => stringifyRecord(record));
};

export const stringifyRecord = (record: any) => {
  if (record) {
    return {
      ...record,
      _id: record._id.toString()
    };
  } else {
    return undefined;
  }
};

export const stringifyFilter = (filter: any) => {
  if (JSON.stringify(filter).includes('_id')) {
    if (filter._id) {
      const id = filter._id;
      if (typeof id === 'string') {
        filter._id = new ObjectId(id);
      } else if (filter._id.$in) {
        filter._id.$in = filter._id.$in.map(x => typeof x === 'string' ? new ObjectId(x) : x);
      } else if (filter._id.$nin) {
        filter._id.$nin = filter._id.$nin.map(x => typeof x === 'string' ? new ObjectId(x) : x);
      } else if (filter._id.$ne) {
        filter._id.$ne = new ObjectId(filter._id.$ne);
      }
    } else if (filter.$or) {
      for (let i = 0; i < filter.$or.length; i++) {
        filter.$or[i] = stringifyFilter(filter.$or[i]);
      }
    } else if (filter.$and) {
      for (let i = 0; i < filter.$and.length; i++) {
        filter.$and[i] = stringifyFilter(filter.$and[i]);
      }
    }
  }
  return filter;
};
