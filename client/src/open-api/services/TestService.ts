/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResetDataOptions } from '../models/ResetDataOptions';
import type { SendFundsDto } from '../models/SendFundsDto';
import type { SendTestEmailDto } from '../models/SendTestEmailDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TestService {

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static resetDb(
        requestBody: ResetDataOptions,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/test/reset',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static resetWalletHistory(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/test/reset-wallet-history',
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
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static sendFunds(
        requestBody: SendFundsDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/test/send-funds',
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
