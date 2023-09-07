import { FilterQuery, OnlyFieldsOfType, SchemaMember, SortOptionObject } from 'mongodb';
import { Logger } from '@nestjs/common';

export interface QueryOptions<RecordT> {
  sort?: SortOptionObject<RecordT>;
  projection?: SchemaMember<RecordT, number>;
  limit?: number;
  offset?: number;
  filter?: FilterQuery<RecordT>;
}

export interface BulkUpdate<BaseT> {
  id: string;
  modifier: OnlyFieldsOfType<BaseT>;
}

export interface UpsertOptions<BaseT> {
  setOnInsert?: OnlyFieldsOfType<BaseT>;
  logger?: Logger
}

export interface UpdateOptions<BaseT> {
  unset?: OnlyFieldsOfType<BaseT, any, 1>;
  logger?: Logger
}
