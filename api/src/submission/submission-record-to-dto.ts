import { SubmissionRecord, SubmissionStatusDto } from '@bcr/types';

export const submissionStatusRecordToDto = (
  submission: SubmissionRecord
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
    isCurrent: submission.isCurrent
  };
};
