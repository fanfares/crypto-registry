/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FundingAddressDto } from '../models/FundingAddressDto';
import type { FundingAddressQueryDto } from '../models/FundingAddressQueryDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FundingAddressService {

    /**
     * @param requestBody 
     * @returns FundingAddressDto 
     * @throws ApiError
     */
    public static query(
requestBody: FundingAddressQueryDto,
): CancelablePromise<Array<FundingAddressDto>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/funding-address/query',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
