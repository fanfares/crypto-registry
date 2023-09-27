/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubmissionWalletStatus } from './SubmissionWalletStatus';

export type SubmissionWallet = {
    paymentAddress?: string;
    paymentAddressIndex?: number;
    paymentAmount?: number;
    balance?: number;
    exchangeZpub: string;
    status: SubmissionWalletStatus;
};
