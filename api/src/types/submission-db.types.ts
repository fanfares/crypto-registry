import { DatabaseRecord } from './db.types';
import { SubmissionStatus } from './submission-dto.types';
import { Network } from '@bcr/types';

export class SubmissionBase {
  receiverAddress: string;
  leaderAddress: string;
  paymentAddress: string;
  paymentAddressIndex: number;
  network: Network;
  paymentAmount: number;
  balanceRetrievalAttempts: number;
  totalCustomerFunds: number;
  totalExchangeFunds?: number;
  status: SubmissionStatus;
  exchangeName: string;
  exchangeZpub: string;
  isCurrent: boolean;
  hash: string | null;
  confirmationsRequired: number | null;
  confirmationDate: Date | null
}

export class SubmissionRecord extends SubmissionBase implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
