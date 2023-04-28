import { DatabaseRecord } from './db.types';
import { SubmissionStatus } from './submission-dto.types';
import { Network } from '@bcr/types';

export class SubmissionBase {
  receiverAddress: string;
  leaderAddress: string;
  paymentAddress: string;
  network: Network;
  paymentAmount: number;
  totalCustomerFunds: number;
  totalExchangeFunds?: number;
  status: SubmissionStatus;
  exchangeName: string;
  exchangeZpub: string;
  isCurrent: boolean;
  hash: string | null;
  precedingHash: string | null;
  index: number | null;
}

export class SubmissionRecord extends SubmissionBase implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
