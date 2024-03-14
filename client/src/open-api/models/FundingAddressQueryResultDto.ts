/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FundingAddressDto } from './FundingAddressDto';

export type FundingAddressQueryResultDto = {
    addresses: Array<FundingAddressDto>;
    total: number;
};
