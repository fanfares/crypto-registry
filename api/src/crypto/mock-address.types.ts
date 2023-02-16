import { DatabaseRecord } from '@bcr/types';
import { Transaction } from './bitcoin.service';

export class MockAddress {
  zpub: string;
  walletName: string;
  forChange: boolean;
  address: string;
  balance: number;
  unspent: boolean;
}

export class MockAddressRecord
  extends MockAddress
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export class MockTransactionRecord
  extends Transaction
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
