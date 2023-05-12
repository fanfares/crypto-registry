/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomerHoldingDto } from './CustomerHoldingDto';

export type CreateSubmissionDto = {
    _id?: string;
    exchangeZpub: string;
    exchangeName: string;
    receiverAddress: string;
    leaderAddress?: string;
    customerHoldings: Array<CustomerHoldingDto>;
    paymentAddress?: string;
    index?: number;
    confirmationsRequired?: number;
};

