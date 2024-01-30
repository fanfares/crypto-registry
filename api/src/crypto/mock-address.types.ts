import { DatabaseRecord, Network, Transaction } from '@bcr/types';

export class MockAddress {
  zpub: string;
  network: Network;
  index: number;
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
