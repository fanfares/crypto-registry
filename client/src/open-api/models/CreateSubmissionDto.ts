/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomerHoldingDto } from './CustomerHoldingDto';
import type { Network } from './Network';
import type { SubmissionWallet } from './SubmissionWallet';

export type CreateSubmissionDto = {
    _id?: string;
    exchangeName: string;
    network: Network;
    receiverAddress: string;
    leaderAddress?: string;
    customerHoldings: Array<CustomerHoldingDto>;
    wallets: Array<SubmissionWallet>;
    confirmationsRequired?: number;
    signingMessage: string;
};
