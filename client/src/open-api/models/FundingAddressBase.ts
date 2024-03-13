/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FundingAddressStatus } from './FundingAddressStatus';
import type { Network } from './Network';

export type FundingAddressBase = {
    balance?: number;
    address: string;
    signature: string;
    message: string;
    fundingSubmissionId: string;
    validFromDate?: string;
    exchangeId: string;
    network: Network;
    status: FundingAddressStatus;
};
