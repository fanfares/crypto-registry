/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { WalletStatus } from './WalletStatus';

export type WalletVerificationDto = {
    custodianName: string;
    publicKey: string;
    status: WalletStatus;
    totalCustomerHoldings: number;
    blockChainBalance: number;
    customerBalance: number;
};
