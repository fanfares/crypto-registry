import { DatabaseRecord, UserIdentity } from '@bcr/types';
import { Transaction } from './bitcoin.service';

export class MockAddressBase {
  zpub: string;
  walletName: string;
  forChange: boolean;
  address: string;
  balance: number;
  unspent: boolean;
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

export class MockTransactionRecord
  extends Transaction
  implements DatabaseRecord {
  _id: string;
  createdBy: UserIdentity;
  createdDate: Date;
  updatedBy: UserIdentity;
  updatedDate: Date;
}
