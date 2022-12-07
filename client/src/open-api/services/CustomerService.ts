/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailDto } from '../models/EmailDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustomerService {

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static verifyHoldings(
requestBody: EmailDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customer/verify',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
