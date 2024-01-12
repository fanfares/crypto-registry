import { Filter, OnlyFieldsOfType, SchemaMember, WithId } from 'mongodb';
import { Logger } from '@nestjs/common';

type SortDirection = 1 | -1;
type FieldsOfRecord<T> = Partial<Record<keyof T, SortDirection>>;

export interface QueryOptions<RecordT> {
  sort?: FieldsOfRecord<RecordT>;
  projection?: FieldsOfRecord<RecordT>;
  limit?: number;
  offset?: number;
  filter?: Filter<RecordT>;
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
