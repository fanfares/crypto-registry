import { DatabaseRecord, Network, Transaction } from '@bcr/types';

export class MockAddress {
  network: Network;
  address: string;
  balance: number;
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
