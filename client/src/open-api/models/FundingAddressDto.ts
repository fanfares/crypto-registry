/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FundingAddressStatus } from './FundingAddressStatus';
import type { Network } from './Network';

export type FundingAddressDto = {
    balance?: number;
    address: string;
    signature: string;
    message: string;
    fundingSubmissionId: string;
    validFromDate?: string;
    exchangeId: string;
    network: Network;
    status: FundingAddressStatus;
    _id: string;
    createdDate: string;
    updatedDate: string;
};
