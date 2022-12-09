import { DatabaseRecord, UserIdentity } from '@bcr/types';

export class MockAddressBase {
  address: string;
  balance: number;
  sendingAddressBalance: number
}

export class MockAddressRecord
  extends MockAddressBase
  implements DatabaseRecord {
  _id: string;
  createdBy: UserIdentity;
  createdDate: Date;
  updatedBy: UserIdentity;
  updatedDate: Date;
}
