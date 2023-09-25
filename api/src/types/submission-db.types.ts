import { DatabaseRecord } from './db.types';
import { SubmissionStatus } from './submission-dto.types';
import { Network } from '@bcr/types';

export class SubmissionWallet {

}

export class SubmissionBase {
  receiverAddress: string;
  leaderAddress: string;
  network: Network;
  status: SubmissionStatus;
  totalCustomerFunds: number;
  exchangeName: string;
  paymentAddress: string;
  paymentAddressIndex: number;
  paymentAmount: number;
  balanceRetrievalAttempts: number;
  totalExchangeFunds?: number;
  exchangeZpub: string;
  isCurrent: boolean;
  confirmationsRequired: number | null;
  confirmationDate: Date | null
}

export class SubmissionRecord extends SubmissionBase implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}
