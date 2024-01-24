/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CreateRegisteredAddressDto } from './CreateRegisteredAddressDto';

export type CreateFundingSubmissionDto = {
    addresses: Array<CreateRegisteredAddressDto>;
    signingMessage: string;
};
