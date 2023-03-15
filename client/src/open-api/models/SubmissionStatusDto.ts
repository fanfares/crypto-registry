/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';
import type { SubmissionStatus } from './SubmissionStatus';

export type SubmissionStatusDto = {
    paymentAddress: string;
    totalCustomerFunds?: number;
    totalExchangeFunds?: number;
    paymentAmount: number;
    exchangeZpub: string;
    exchangeName: string;
    network: Network;
    isCurrent: boolean;
    status: SubmissionStatus;
};

