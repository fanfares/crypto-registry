import { DatabaseRecord } from './db.types';

export class WalletAddress {
  address: string;
  zpub: string;
  index: number;
}

export class WalletAddressRecord
  extends WalletAddress
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
