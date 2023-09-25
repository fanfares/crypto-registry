import { SubmissionDto, SubmissionRecord } from '@bcr/types';
import { SubmissionConfirmationRecord } from '../types/submission-confirmation.types';

export const submissionStatusRecordToDto = (
  submission: SubmissionRecord,
  confirmations: SubmissionConfirmationRecord[]
): SubmissionDto => {
  return {
    _id: submission._id,
    paymentAddress: submission.paymentAddress,
    exchangeZpub: submission.exchangeZpub,
    totalCustomerFunds: submission.totalCustomerFunds,
    totalExchangeFunds: submission.totalExchangeFunds,
    balanceRetrievalAttempts: submission.balanceRetrievalAttempts,
    paymentAmount: submission.paymentAmount,
    network: submission.network,
    status: submission.status,
    exchangeName: submission.exchangeName,
    isCurrent: submission.isCurrent,
    initialNodeAddress: submission.receiverAddress,
    confirmationsRequired: submission.confirmationsRequired,
    confirmations: confirmations.map(c => ({
      submissionId: submission._id,
      nodeAddress: c.nodeAddress,
      status: c.status,
    }))
  };
};
