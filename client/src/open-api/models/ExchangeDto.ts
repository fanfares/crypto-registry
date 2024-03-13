/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExchangeStatus } from './ExchangeStatus';
import type { Network } from './Network';

export type ExchangeDto = {
    name: string;
    currentFunds?: number;
    fundingSource?: Network;
    currentHoldings?: number;
    shortFall?: number;
    status: ExchangeStatus;
    holdingsAsAt?: string;
    fundingAsAt?: string;
    _id: string;
    createdDate: string;
    updatedDate: string;
};
