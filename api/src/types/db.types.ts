export interface DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface IUpsertResult {
  insertedCount: number;
  updatedCount: number;
}
