/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';
import type { SubmissionConfirmation } from './SubmissionConfirmation';
import type { SubmissionStatus } from './SubmissionStatus';

export type SubmissionDto = {
    _id: string;
    paymentAddress: string;
    initialNodeAddress: string;
    hash: string;
    totalCustomerFunds?: number;
    totalExchangeFunds?: number;
    paymentAmount: number;
    exchangeZpub: string;
    exchangeName: string;
    network: Network;
    isCurrent: boolean;
    status: SubmissionStatus;
    confirmations: Array<SubmissionConfirmation>;
};

