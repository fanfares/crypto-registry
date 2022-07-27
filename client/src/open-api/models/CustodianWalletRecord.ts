/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { WalletStatus } from './WalletStatus';

export type CustodianWalletRecord = {
    custodianName: string;
    publicKey: string;
    status: WalletStatus;
    totalCustomerHoldings: number;
    blockChainBalance: number;
    _id: string;
    /**
     * Date on which the employee document was created
     */
    createdDate: string;
    /**
     * Identity who created record
     */
    createdBy: any;
    /**
     * The identity of the last user to make an update
     */
    updatedBy: any;
    /**
     * Date on which the employee document was last updated
     */
    updatedDate: string;
};
