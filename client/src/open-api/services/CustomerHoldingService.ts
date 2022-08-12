/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HashedEmailDto } from '../models/HashedEmailDto';
import type { SendTestEmailDto } from '../models/SendTestEmailDto';
import type { WalletVerificationDto } from '../models/WalletVerificationDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustomerHoldingService {

    /**
     * @param requestBody
     * @returns WalletVerificationDto
     * @throws ApiError
     */
    public static verifyWallet(
requestBody: HashedEmailDto,
): CancelablePromise<WalletVerificationDto> {
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
