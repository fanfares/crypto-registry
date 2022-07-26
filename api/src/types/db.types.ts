import { UserIdentity } from './user-identity.types';

export interface DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
  updatedBy: UserIdentity;
  createdBy: UserIdentity;
}

export interface IUpsertResult {
  insertedCount: number;
  updatedCount: number;
}
