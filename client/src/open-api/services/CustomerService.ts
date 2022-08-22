/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailDto } from '../models/EmailDto';
import type { VerificationDto } from '../models/VerificationDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustomerService {

    /**
     * @param requestBody 
     * @returns VerificationDto 
     * @throws ApiError
     */
    public static verifyHoldings(
requestBody: EmailDto,
): CancelablePromise<VerificationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customer/verify-holdings',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
