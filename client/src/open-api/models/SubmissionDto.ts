/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';
import type { SubmissionConfirmationBase } from './SubmissionConfirmationBase';
import type { SubmissionStatus } from './SubmissionStatus';

export type SubmissionDto = {
    _id: string;
    paymentAddress: string;
    initialNodeAddress: string;
    hash?: string;
    totalCustomerFunds?: number;
    totalExchangeFunds?: number;
    balanceRetrievalAttempts: number;
    paymentAmount: number;
    exchangeZpub: string;
    exchangeName: string;
    network: Network;
    isCurrent: boolean;
    status: SubmissionStatus;
    confirmations: Array<SubmissionConfirmationBase>;
    confirmationsRequired?: number;
    index?: number;
};
