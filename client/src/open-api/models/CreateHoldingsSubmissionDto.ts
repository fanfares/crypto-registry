/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';

export type CreateHoldingsSubmissionDto = {
    network: Network;
    holdings: Array<string>;
};
