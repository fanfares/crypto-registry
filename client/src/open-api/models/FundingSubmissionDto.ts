/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FundingAddressBase } from './FundingAddressBase';
import type { FundingSubmissionStatus } from './FundingSubmissionStatus';

export type FundingSubmissionDto = {
    errorMessage?: string;
    network: string;
    status: FundingSubmissionStatus;
    exchangeId: string;
    totalFunds: number;
    isCurrent: boolean;
    _id: string;
    createdDate: string;
    updatedDate: string;
    addresses: Array<FundingAddressBase>;
};
