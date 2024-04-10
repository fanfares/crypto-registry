import { getNow } from '../utils';
import {
  AnyBulkWriteOperation,
  Collection,
  Filter,
  FindOptions,
  ObjectId,
  OnlyFieldsOfType,
  SchemaMember,
  Sort,
  WithId
} from 'mongodb';
import { StringifyDbInterceptor } from './stringify-db-interceptor';
import { DatabaseRecord } from '@bcr/types';
import { DbInterceptor } from './db-interceptor';
import { mergeFilterWithOptions } from './merge-filter-with-options';
import { MongoService } from './mongo.service';
import { Logger } from '@nestjs/common';
import { BulkUpdate, QueryOptions, UpdateOptions } from './db-api.types';

export interface DbInsertOptions {
  _id: string;
  logger?: Logger;
}


export class DbApi<BaseT, RecordT extends WithId<DatabaseRecord>> {
  private readonly logger: Logger;

  constructor(
    protected mongoService: MongoService,
    protected collectionName: string,
    protected dbInterceptors: DbInterceptor[] = []
  ) {
    this.dbInterceptors.push(new StringifyDbInterceptor());
    this.logger = mongoService.logger;
  }

  private processRecordArray(data: object[]) {
    let result = data;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processRecordArray(result);
    });
    return result;
  }

  private processBaseArray(data: any[]) {
    let result = data;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processBaseArray(result);
    });
    return result;
  }

  private processRecordData(record: any | void): RecordT {
    if (!record) {
      return;
    }
    let result = record;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processRecord(result);
    });
    return result as RecordT;
  }

  private processBaseData(baseData: any) {
    if (!baseData) {
      return;
    }
    let result = baseData;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processBase(result);
    });
    return result;
  }

  processFilterInterceptors(filter: Filter<RecordT>): Filter<RecordT> {
    let result = filter;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processFilter(result);
    });
    return result;
  }

  async insert(
    data: BaseT,
    options?: DbInsertOptions
  ): Promise<string> {
    const logger = options?.logger || this.logger;
    logger.debug('dbApi insert', {
      collection: this.collectionName,
      data,
      options
    });
    const now = getNow();
    let processedData = this.processBaseData(data);
    if (options?._id) {
      processedData = {...processedData, _id: new ObjectId(options._id)};
    }
    const result = await this.mongoService.db
    .collection(this.collectionName)
    .insertOne({
      createdDate: now,
      updatedDate: now,
      ...processedData
    });
    return result.insertedId.toString();
  }

  async insertMany(data: BaseT[], logger?: Logger): Promise<string[]> {
    const loggerToUse = logger || this.logger;
    loggerToUse.debug('dbApi insert many', {
      collection: this.collectionName,
      data: data.slice(0, 10),
      dataLength:data.length,
      count: data.length
    });
    if (data.length > 0) {
      const now = getNow();
      const records = this.processBaseArray(data).map((base) => ({
        ...base,
        createdDate: now,
        updatedDate: now
      }));

      const result = await this.mongoService.db
      .collection(this.collectionName)
      .insertMany(records);

      const ids = Object.values(result.insertedIds);
      return ids.map((x) => x.toString());
    } else {
      return [];
    }
  }

  async insertManyRecords(data: RecordT[], logger?: Logger): Promise<string[]> {
    const loggerToUse = logger || this.logger;
    loggerToUse.debug('dbApi insert many records', {
      collection: this.collectionName,
      data: data,
      count: data.length
    });
    const baseData: BaseT[] = data.map(d => {
      const copy: any = {
        ...d,
        _id: new ObjectId(d._id)
      };
      delete copy['createdDate'];
      delete copy['updatedDate'];
      return copy;
    });
    return this.insertMany(baseData);
  }

  async get(
    id: string,
    projection?: SchemaMember<RecordT, number>
  ): Promise<RecordT> {
    if (!ObjectId.isValid(id)) {
      return undefined;
    }

    const result = await this.mongoService.db
    .collection(this.collectionName)
    .findOne({
      _id: new ObjectId(id)
    }, {
      projection: projection
    });

    if (!result) {
      return undefined;
    }
    return this.processRecordData(result);
  }

  async findByIds(ids: string[], queryOptions?: QueryOptions<RecordT>) {
    return this.find({_id: {$in: ids}} as any, queryOptions);
  }

  async find(
    filter: Filter<RecordT>,
    options?: QueryOptions<RecordT>
  ): Promise<RecordT[]> {
    const mergedFilter = this.processFilterInterceptors(
      mergeFilterWithOptions<RecordT>(filter, options)
    );

    let cursor = this.collection.find(mergedFilter);

    if (options?.sort) {
      cursor = cursor.sort(options.sort);
    }

    if (options?.projection) {
      cursor = cursor.project(options.projection);
    }

    if (options?.offset) {
      cursor = cursor.skip(options.offset);
    }

    if (options?.limit) {
      cursor = cursor.limit(options.limit);
    }

    const result = await cursor.toArray();
    return this.processRecordArray(result) as RecordT[];
  }

  async findOne(
    filter: Filter<RecordT>,
    options?: QueryOptions<RecordT>
  ): Promise<RecordT> {
    const queryOptions: FindOptions<RecordT> = {};

    if (options?.sort) {
      queryOptions.sort = options.sort as Sort;
    }

    if (options?.projection) {
      queryOptions.projection = options.projection;
    }

    if (options?.offset) {
      queryOptions.skip = options.offset;
    }

    if (options?.limit) {
      queryOptions.limit = options.limit;
    }

    const processedFilter = this.processFilterInterceptors(filter);
    const result = await this.collection.findOne(processedFilter, queryOptions);
    return this.processRecordData(result);
  }

  async update(
    id: string,
    update: Partial<BaseT>,
    options?: UpdateOptions<RecordT>
  ) {
    const logger = options?.logger || this.logger;
    logger.debug('dbApi update', {
      collection: this.collectionName,
      id,
      update
    });
    let unset: any;
    if (options?.unset) {
      unset = {$unset: options.unset};
    }

    const result = await this.mongoService.db
    .collection(this.collectionName)
    .updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...this.processBaseData(update as BaseT),
          updatedDate: getNow()
        },
        ...unset
      }
    );

    return result.modifiedCount;
  }

  async delete(id: string): Promise<number> {
    this.logger.debug('dbApi delete', {collection: this.collectionName, id});
    const item = await this.get(id);

    if (item) {
      const result = await this.mongoService.db
      .collection(this.collectionName)
      .deleteOne({
        _id: new ObjectId(id)
      });
      return result.deletedCount;
    }

    return 0;
  }

  async printStatus() {
    return this.collectionName + ':' + await this.count({});
  }

  async deleteMany(
    filter: OnlyFieldsOfType<RecordT>
  ): Promise<number> {
    this.logger.debug('dbApi deleteMany', {
      collection: this.collectionName,
      filter
    });
    const unDeletedFilter = {...filter};
    const processedFilter = this.processFilterInterceptors(unDeletedFilter);

    const items = await this.find(processedFilter);
    if (items.length > 0) {
      const result = await this.collection.deleteMany(processedFilter);
      return result.deletedCount;
    }
    return 0;
  }

  async count(
    filter: Filter<RecordT>,
    options?: QueryOptions<RecordT>
  ): Promise<number> {
    const mergedFilter = this.processFilterInterceptors(
      mergeFilterWithOptions<RecordT>(filter, options)
    );
    return await this.collection.countDocuments(mergedFilter);
  }

  async bulkUpdate(
    updates: BulkUpdate<BaseT>[]
  ): Promise<number> {
    this.logger.debug('dbApi bulkUpdate', {
      collection: this.collectionName,
      firstUpdate: updates[0],
      count: updates.length
    });
    const updateTime = getNow();
    const bulkWrites: AnyBulkWriteOperation<RecordT>[] = updates.map((update) => ({
      updateOne: {
        filter: {_id: new ObjectId(update.id)},
        update: {
          $set: {
            ...this.processBaseData(update.modifier as BaseT),
            updatedDate: updateTime
          }
        }
      }
    })) as any;

    const result = await this.collection.bulkWrite(bulkWrites, {
      ordered: false
    });

    // logger.debug(this.collectionName + ' bulkUpdate: ' + getElapsed(start) + 'ms, ' + updates.length + ' updates');
    return result.modifiedCount;
  }

  async updateMany(
    filter: any,
    modifier: OnlyFieldsOfType<BaseT>,
    logger?: Logger
  ) {
    const loggerToUse = logger || this.logger;
    loggerToUse.debug('dbApi updateMany', {
      collection: this.collectionName,
      filter,
      modifier
    });
    const processedFilter = this.processFilterInterceptors(filter);
    const result = await this.collection.updateMany(processedFilter, {
      $set: {
        ...this.processBaseData(modifier as any),
        updatedDate: getNow()
      }
    });
    return result.modifiedCount;
  }

  async findOneAndUpdate(
    filter: any,
    modifier: OnlyFieldsOfType<BaseT>,
    logger?: Logger
  ): Promise<RecordT> {
    const loggerToUse = logger || this.logger;
    loggerToUse.debug('dbApi findOneAndUpdate', {
      collection: this.collectionName,
      filter,
      modifier
    });
    const processedFilter = this.processFilterInterceptors(filter);
    const result = await this.collection.findOneAndUpdate(processedFilter, {
      $set: {
        ...this.processBaseData(modifier as BaseT),
        updatedDate: getNow()
      }
    });

    return result as RecordT;
  }

  get collection(): Collection<RecordT> {
    return this.mongoService.db.collection(this.collectionName);
  }

  aggregate(pipeline: any[]): Promise<any[]> {
    return this.mongoService.db
    .collection(this.collectionName)
    .aggregate(pipeline)
    .toArray();
  }
}
