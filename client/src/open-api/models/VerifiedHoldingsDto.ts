/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';

export type VerifiedHoldingsDto = {
    holdingId: string;
    fundingAsAt: string;
    customerHoldingAmount: number;
    exchangeName: string;
    fundingSource: Network;
};
