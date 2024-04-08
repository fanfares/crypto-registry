/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendTestEmailDto } from '../models/SendTestEmailDto';
import type { ServiceTestResultsDto } from '../models/ServiceTestResultsDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TestService {

    /**
     * @returns ServiceTestResultsDto 
     * @throws ApiError
     */
    public static testBitcoinService(): CancelablePromise<ServiceTestResultsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/test/service-test',
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
