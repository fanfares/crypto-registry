import { FilterQuery } from 'mongodb';
import { QueryOptions } from './db-api.types';

export function mergeFilterWithOptions<RecordT>(
  filter: FilterQuery<RecordT>,
  options?: QueryOptions<RecordT>,
): FilterQuery<RecordT> {
  let combinedFilter = {
    ...filter,
  };
  if (options?.filter) {
    combinedFilter = {
      ...combinedFilter,
      ...options.filter,
    };
  }
  return combinedFilter;
}
