/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FundingSubmissionDto } from './FundingSubmissionDto';

export type FundingDto = {
    current: FundingSubmissionDto;
    pending?: FundingSubmissionDto;
};
