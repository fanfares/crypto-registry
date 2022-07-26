/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomerHolding } from './CustomerHolding';

export type RegisterCustodianWalletDto = {
    custodianName: string;
    publicKey: string;
    customerHoldings: Array<CustomerHolding>;
};
