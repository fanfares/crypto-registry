import { DatabaseRecord } from '@bcr/types';

export function recordToBase<BaseT, RecordT extends DatabaseRecord>(record: RecordT): BaseT {
  const dto = { ...record };
  delete dto._id;
  delete dto.createdDate;
  delete dto.updatedDate;
  return dto as any as BaseT;
}
