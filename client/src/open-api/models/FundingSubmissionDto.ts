/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FundingSubmissionStatus } from './FundingSubmissionStatus';
import type { RegisteredAddress } from './RegisteredAddress';

export type FundingSubmissionDto = {
    errorMessage?: string;
    network: string;
    status: FundingSubmissionStatus;
    exchangeId: string;
    addresses: Array<RegisteredAddress>;
    totalFunds: number;
    signingMessage: string;
    isCurrent: boolean;
    _id: string;
    createdDate: string;
    updatedDate: string;
};

