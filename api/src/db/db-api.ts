import { getNow } from '../utils';
import { FilterQuery, FindOneOptions, ObjectId, OnlyFieldsOfType } from 'mongodb';
import { StringifyDbInterceptor } from './stringify-db-interceptor';
import { DatabaseRecord, IUpsertResult } from '@bcr/types';
import { DbInterceptor } from './db-interceptor';
import { mergeFilterWithOptions } from './merge-filter-with-options';
import { MongoService } from './mongo.service';
import { Logger } from '@nestjs/common';
import { BulkUpdate, QueryOptions, UpdateOptions, UpsertOptions } from './db-api.types';

export class DbApi<BaseT, RecordT extends DatabaseRecord> {
  private logger: Logger;

  constructor(
    protected mongoService: MongoService,
    protected collectionName: string,
    protected dbInterceptors: DbInterceptor<BaseT, RecordT>[] = []
  ) {
    this.dbInterceptors.push(new StringifyDbInterceptor());
    this.logger = mongoService.logger;
  }

  private processRecordArray(data: RecordT[]) {
    let result = data;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processRecordArray(result);
    });
    return result;
  }

  private processBaseArray(data: BaseT[]) {
    let result = data;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processBaseArray(result);
    });
    return result;
  }

  private processRecordData(record: RecordT | void) {
    if (!record) {
      return;
    }
    let result = record;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processRecord(result);
    });
    return result;
  }

  private processBaseData(baseData: BaseT) {
    if (!baseData) {
      return;
    }
    let result = baseData;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processBase(result);
    });
    return result;
  }

  processFilterInterceptors(filter: FilterQuery<RecordT>) {
    let result = filter;
    this.dbInterceptors.forEach((interceptor) => {
      result = interceptor.processFilter(result);
    });
    return result;
  }

  async insert(data: BaseT): Promise<string> {
    this.logger.debug('dbApi insert', {
      collection: this.collectionName,
      data
    });
    const now = getNow();
    const processedData = this.processBaseData(data);
    const result = await this.mongoService.db
      .collection(this.collectionName)
      .insertOne({
        createdDate: now,
        updatedDate: now,
        ...processedData
      });
    return result.insertedId.toString();
  }

  async insertMany(data: BaseT[]): Promise<string[]> {
    this.logger.debug('dbApi insert many', {
      collection: this.collectionName,
      data: data,
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

  async insertManyRecords(data: RecordT[]): Promise<string[]> {
    this.logger.debug('dbApi insert many records', {
      collection: this.collectionName,
      data: data,
      count: data.length
    });
    const baseData: BaseT[] = data.map(d => {
      const copy: any = { ...d };
      delete copy['_id'];
      delete copy['createdDate'];
      delete copy['updatedDate'];
      return copy;
    });
    return this.insertMany(baseData);
  }

  async get(id: string): Promise<RecordT> {
    const result = await this.mongoService.db
      .collection(this.collectionName)
      .findOne({
        _id: new ObjectId(id)
      });

    if (!result) {
      return undefined;
    }
    return this.processRecordData(result);
  }

  async findByIds(ids: string[], queryOptions?: QueryOptions<RecordT>) {
    return this.find({ _id: { $in: ids } } as any, queryOptions);
  }

  async find(
    filter: FilterQuery<RecordT>,
    options?: QueryOptions<RecordT>
  ): Promise<RecordT[]> {
    const mergedFilter = this.processFilterInterceptors(
      mergeFilterWithOptions<RecordT>(filter, options)
    );

    // const start = Date.now();
    let cursor = await this.mongoService.db
      .collection(this.collectionName)
      .find(mergedFilter);

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
    // logger.debug(this.collectionName + ' find: ' + getElapsed(start), filter);
    return this.processRecordArray(result);
  }

  async findOne(
    filter: FilterQuery<RecordT>,
    options?: QueryOptions<RecordT>
  ): Promise<RecordT> {
    const queryOptions: FindOneOptions<RecordT> = {};

    if (options?.sort) {
      queryOptions.sort = options.sort;
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
    const result = await this.mongoService.db
      .collection(this.collectionName)
      .findOne(
        {
          ...processedFilter
        },
        queryOptions as FindOneOptions<any>
      );

    return this.processRecordData(result);
  }

  async update(
    id: string,
    update: OnlyFieldsOfType<BaseT>,
    options?: UpdateOptions<RecordT>
  ) {
    this.logger.debug('dbApi update', {
      collection: this.collectionName,
      id,
      update
    });
    let unset: any;
    if (options?.unset) {
      unset = { $unset: options.unset };
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
    this.logger.debug('dbApi delete', { collection: this.collectionName, id });
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

  async deleteMany(
    filter: OnlyFieldsOfType<RecordT>
  ): Promise<number> {
    this.logger.debug('dbApi deleteMany', {
      collection: this.collectionName,
      filter
    });
    const unDeletedFilter = { ...filter };
    const processedFilter = this.processFilterInterceptors(unDeletedFilter);

    const items = await this.find(processedFilter);
    if (items.length > 0) {
      const result = await this.mongoService.db
        .collection(this.collectionName)
        .deleteMany(processedFilter);
      return result.deletedCount;
    }
    return 0;
  }

  async count(
    filter: FilterQuery<RecordT>,
    options?: QueryOptions<RecordT>
  ): Promise<number> {
    const mergedFilter = this.processFilterInterceptors(
      mergeFilterWithOptions<RecordT>(filter, options)
    );
    return await this.mongoService.db
      .collection(this.collectionName)
      .countDocuments(mergedFilter);
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
    const bulkWrites = updates.map((update) => ({
      updateOne: {
        filter: { _id: new ObjectId(update.id) },
        update: {
          $set: {
            ...this.processBaseData(update.modifier as BaseT),
            updatedDate: updateTime
          }
        }
      }
    }));

    const result = await this.mongoService.db
      .collection(this.collectionName)
      .bulkWrite(bulkWrites, {
        ordered: false
      });

    // logger.debug(this.collectionName + ' bulkUpdate: ' + getElapsed(start) + 'ms, ' + updates.length + ' updates');
    return result.modifiedCount;
  }

  async updateMany(
    filter: any,
    modifier: OnlyFieldsOfType<BaseT>
  ) {
    this.logger.debug('dbApi updateMany', {
      collection: this.collectionName,
      filter,
      modifier
    });
    const processedFilter = this.processFilterInterceptors(filter);
    const result = await this.mongoService.db
      .collection(this.collectionName)
      .updateMany(processedFilter, {
        $set: {
          ...this.processBaseData(modifier as any),
          updatedDate: getNow()
        }
      });
    return result.modifiedCount;
  }

  async upsertMany(
    filter: any,
    modifier: OnlyFieldsOfType<BaseT>,
    options?: UpsertOptions<BaseT>
  ): Promise<IUpsertResult> {
    this.logger.debug('dbApi upsertMany', {
      collection: this.collectionName,
      filter,
      modifier
    });
    const processedFilter = this.processFilterInterceptors(filter);
    const result = await this.mongoService.db
      .collection(this.collectionName)
      .updateMany(
        processedFilter,
        {
          $set: {
            ...this.processBaseData(modifier as BaseT),
            updatedDate: getNow()
          },
          $setOnInsert: {
            ...(options?.setOnInsert || {}),
            createdDate: getNow()
          }
        },
        {
          upsert: true
        }
      );
    return {
      insertedCount: result.upsertedCount,
      updatedCount: result.modifiedCount
    };
  }

  async findOneAndUpdate(
    filter: any,
    modifier: OnlyFieldsOfType<BaseT>
  ): Promise<RecordT> {
    this.logger.debug('dbApi findOneAndUpdate', {
      collection: this.collectionName,
      filter,
      modifier
    });
    const processedFilter = this.processFilterInterceptors(filter);
    const result = await this.mongoService.db
      .collection(this.collectionName)
      .findOneAndUpdate(processedFilter, {
        $set: {
          ...this.processBaseData(modifier as BaseT),
          updatedDate: getNow()
        }
      });

    return result.value;
  }

  async upsertOne(
    filter: any,
    modifier: OnlyFieldsOfType<BaseT>,
    options?: UpsertOptions<BaseT>
  ): Promise<IUpsertResult> {
    this.logger.debug('dbApi upsertOne', {
      collection: this.collectionName,
      filter,
      modifier
    });
    const processedFilter = this.processFilterInterceptors(filter);
    const result = await this.mongoService.db
      .collection(this.collectionName)
      .updateOne(
        processedFilter,
        {
          $set: {
            ...this.processBaseData(modifier as BaseT),
            updatedDate: getNow()
          },
          $setOnInsert: {
            ...(options?.setOnInsert || {}),
            createdDate: getNow()
          }
        },
        {
          upsert: true
        }
      );
    return {
      insertedCount: result.upsertedCount,
      updatedCount: result.modifiedCount
    };
  }

  get collection() {
    return this.mongoService.db.collection(this.collectionName);
  }

  aggregate(pipeline: any[]): Promise<any[]> {
    return this.mongoService.db
      .collection(this.collectionName)
      .aggregate(pipeline)
      .toArray();
  }
}
