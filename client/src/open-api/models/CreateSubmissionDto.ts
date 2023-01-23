/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomerHoldingDto } from './CustomerHoldingDto';
import type { Network } from './Network';

export type CreateSubmissionDto = {
    exchangeZpub: string;
    network: Network;
    exchangeName: string;
    customerHoldings: Array<CustomerHoldingDto>;
};
