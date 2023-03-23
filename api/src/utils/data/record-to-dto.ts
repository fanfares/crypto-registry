import { DatabaseRecord } from '@bcr/types';

export function recordToBase<T extends DatabaseRecord>(record: T) {
  const dto = { ...record };
  delete dto._id;
  delete dto.createdDate;
  delete dto.updatedDate;
  return dto;
}
