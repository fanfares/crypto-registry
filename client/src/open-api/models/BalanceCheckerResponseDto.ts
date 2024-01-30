/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';

export type BalanceCheckerResponseDto = {
    network: Network;
    electrumBalance: number;
    blockStreamBalance: number;
};
