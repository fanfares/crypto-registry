/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomerHoldingDto } from './CustomerHoldingDto';

export type SubmissionDto = {
    exchangeName: string;
    customerHoldings: Array<CustomerHoldingDto>;
};
