import { SubmissionDto, SubmissionRecord } from '@bcr/types';
import { SubmissionConfirmationRecord } from '../types/submission-confirmation.types';

export const submissionStatusRecordToDto = (
  submission: SubmissionRecord,
  confirmations: SubmissionConfirmationRecord[]
): SubmissionDto => {
  return {
    _id: submission._id,
    wallets: submission.wallets,
    totalCustomerFunds: submission.totalCustomerFunds,
    totalExchangeFunds: submission.totalExchangeFunds,
    network: submission.network,
    status: submission.status,
    exchangeName: submission.exchangeName,
    isCurrent: submission.isCurrent,
    receiverAddress: submission.receiverAddress,
    signingMessage: submission.signingMessage,
    confirmationsRequired: submission.confirmationsRequired,
    confirmationDate: submission.confirmationDate,
    errorMessage: submission.errorMessage,
    confirmations: confirmations.map(c => ({
      submissionId: submission._id,
      nodeAddress: c.nodeAddress,
      status: c.status
    }))
  };
};
