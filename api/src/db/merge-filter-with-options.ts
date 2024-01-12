import { Filter } from 'mongodb';
import { QueryOptions } from './db-api.types';

export function mergeFilterWithOptions<RecordT>(
  filter: Filter<RecordT>,
  options?: QueryOptions<RecordT>
): Filter<RecordT> {
  let combinedFilter = {
    ...filter
  };
  if (options?.filter) {
    combinedFilter = {
      ...combinedFilter,
      ...options.filter
    };
  }
  return combinedFilter;
}
