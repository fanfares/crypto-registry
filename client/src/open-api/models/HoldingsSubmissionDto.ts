/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';

export type HoldingsSubmissionDto = {
    totalHoldings: number;
    exchangeId: string;
    isCurrent: boolean;
    network: Network;
    _id: string;
    createdDate: string;
    updatedDate: string;
    holdings: Array<string>;
};
