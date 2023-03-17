import { SubmissionRecord, SubmissionStatusDto } from '@bcr/types';
import { SubmissionConfirmationRecord } from '../types/submission-confirmation.types';

export const submissionStatusRecordToDto = (
  submission: SubmissionRecord,
  confirmations: SubmissionConfirmationRecord[]
): SubmissionStatusDto => {
  return {
    paymentAddress: submission.paymentAddress,
    exchangeZpub: submission.exchangeZpub,
    totalCustomerFunds: submission.totalCustomerFunds,
    totalExchangeFunds: submission.totalExchangeFunds,
    paymentAmount: submission.paymentAmount,
    network: submission.network,
    status: submission.status,
    exchangeName: submission.exchangeName,
    isCurrent: submission.isCurrent,
    hash: submission.hash,
    initialNodeAddress: submission.initialNodeAddress,
    confirmations: confirmations.map(c => ({
      submissionId: submission._id,
      nodeAddress: c.nodeAddress,
      confirmed: c.confirmed
    }))
  };
};
