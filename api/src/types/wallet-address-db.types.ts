import { DatabaseRecord } from './db.types';
import { Network } from './network.type';

export class WalletAddress {
  index: number;
  address: string;
  zpub: string;
  network: Network;
}

export class WalletAddressRecord
  extends WalletAddress
  implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
