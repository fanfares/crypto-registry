import { SubmissionRecord, SubmissionStatusDto } from '@bcr/types';

export const submissionStatusRecordToDto = (
  submission: SubmissionRecord
): SubmissionStatusDto => {
  return {
    paymentAddress: submission.paymentAddress,
    totalCustomerFunds: submission.totalCustomerFunds,
    totalExchangeFunds: submission.totalExchangeFunds,
    paymentAmount: submission.paymentAmount,
    submissionStatus: submission.submissionStatus,
    exchangeName: submission.exchangeName
  };
};
