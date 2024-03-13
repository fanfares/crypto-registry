/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FundingAddressStatus } from './FundingAddressStatus';

export type FundingAddressBase = {
    balance: number;
    address: string;
    signature: string;
    message: string;
    fundingSubmissionId: string;
    validFromDate: string;
    exchangeId: string;
    network: string;
    status: FundingAddressStatus;
};
