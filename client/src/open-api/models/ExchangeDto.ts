/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExchangeStatus } from './ExchangeStatus';
import type { FundingSubmissionDto } from './FundingSubmissionDto';
import type { HoldingsSubmissionDto } from './HoldingsSubmissionDto';

export type ExchangeDto = {
    name: string;
    currentFunds: number;
    fundingSource: string;
    currentHoldings: number;
    status: ExchangeStatus;
    holdingsAsAt?: string;
    fundingAsAt?: string;
    funding?: FundingSubmissionDto;
    holdings?: HoldingsSubmissionDto;
    _id: string;
    createdDate: string;
    updatedDate: string;
};
