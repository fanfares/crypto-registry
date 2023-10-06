/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubmissionConfirmationBase } from './SubmissionConfirmationBase';
import type { SubmissionStatus } from './SubmissionStatus';
import type { SubmissionWallet } from './SubmissionWallet';

export type SubmissionDto = {
    receiverAddress: string;
    errorMessage?: string;
    network: string;
    status: SubmissionStatus;
    totalCustomerFunds: number;
    totalExchangeFunds: number;
    exchangeName: string;
    wallets: Array<SubmissionWallet>;
    signingMessage: string;
    isCurrent: boolean;
    confirmationsRequired: number;
    confirmationDate: string;
    _id: string;
    confirmations: Array<SubmissionConfirmationBase>;
};
