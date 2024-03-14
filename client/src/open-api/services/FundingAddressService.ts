/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FundingAddressQueryDto } from '../models/FundingAddressQueryDto';
import type { FundingAddressQueryResultDto } from '../models/FundingAddressQueryResultDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FundingAddressService {

    /**
     * @param requestBody 
     * @returns FundingAddressQueryResultDto 
     * @throws ApiError
     */
    public static query(
requestBody: FundingAddressQueryDto,
): CancelablePromise<FundingAddressQueryResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/funding-address/query',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param address 
     * @returns any 
     * @throws ApiError
     */
    public static deleteAddress(
address: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/funding-address/{address}',
            path: {
                'address': address,
            },
        });
    }

}
