import { DatabaseRecord } from './db.types';
import { Network } from './network.type';

export class WalletAddress {
  address: string;
  zpub: string;
  index: number;
  network: Network;
}

export class WalletAddressRecord
  extends WalletAddress
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
