/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CreateFundingAddressDto } from './CreateFundingAddressDto';

export type CreateFundingSubmissionDto = {
    addresses: Array<CreateFundingAddressDto>;
    resetFunding: boolean;
};
