/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExchangeStatus } from './ExchangeStatus';

export type ExchangeDto = {
    name: string;
    currentFunds: number;
    fundingSource: string;
    currentHoldings: number;
    shortFall?: number;
    status: ExchangeStatus;
    holdingsAsAt?: string;
    fundingAsAt?: string;
    _id: string;
    createdDate: string;
    updatedDate: string;
};
