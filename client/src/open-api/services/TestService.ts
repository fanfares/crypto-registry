/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendTestEmailDto } from '../models/SendTestEmailDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TestService {

    /**
     * @param network 
     * @returns any 
     * @throws ApiError
     */
    public static testBitcoinService(
network: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/test/test-electrum/{network}',
            path: {
                'network': network,
            },
        });
    }

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static sendTestVerificationEmail(
requestBody: SendTestEmailDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/test/send-test-verification-email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any 
     * @throws ApiError
     */
    public static getGuardedRoute(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/test/guarded-route',
        });
    }

}
