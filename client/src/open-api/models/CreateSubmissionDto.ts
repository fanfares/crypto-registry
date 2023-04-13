/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomerHoldingDto } from './CustomerHoldingDto';

export type CreateSubmissionDto = {
    _id?: string;
    exchangeZpub: string;
    exchangeName: string;
    initialNodeAddress: string;
    customerHoldings: Array<CustomerHoldingDto>;
    paymentAddress?: string;
    index?: number;
};
