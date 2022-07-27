/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HashedEmailDto } from '../models/HashedEmailDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustomerHoldingService {

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static verifyWallet(
requestBody: HashedEmailDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customer-holding/verify',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
