/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CreateRegisteredAddressDto } from './CreateRegisteredAddressDto';
import type { Network } from './Network';

export type CreateFundingSubmissionDto = {
    exchangeId: string;
    network: Network;
    addresses: Array<CreateRegisteredAddressDto>;
    signingMessage: string;
};
