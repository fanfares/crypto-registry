/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomerHoldingDto } from './CustomerHoldingDto';

export type CreateSubmissionDto = {
    exchangeZpub: any;
    exchangeName: any;
    initialNodeAddress: any;
    customerHoldings: Array<CustomerHoldingDto>;
    paymentAddress?: string;
};

