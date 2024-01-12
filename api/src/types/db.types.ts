export interface DatabaseRecord extends Document {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface IUpsertResult {
  insertedCount: number;
  updatedCount: number;
}
