/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailDto } from '../models/EmailDto';
import type { SendTestEmailDto } from '../models/SendTestEmailDto';
import type { VerificationDto } from '../models/VerificationDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustomerHoldingService {

    /**
     * @param requestBody 
     * @returns VerificationDto 
     * @throws ApiError
     */
    public static verifyWallet(
requestBody: EmailDto,
): CancelablePromise<VerificationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customer-holding/verify',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static sendTestEmail(
requestBody: SendTestEmailDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customer-holding/send-test-email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
