import { SortOptionObject, SchemaMember, FilterQuery, OnlyFieldsOfType } from 'mongodb';

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
}

export interface UpdateOptions<BaseT> {
  unset: OnlyFieldsOfType<BaseT, any, 1>;
}
