/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendTestEmailDto } from '../models/SendTestEmailDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TestService {

    /**
     * @returns any 
     * @throws ApiError
     */
    public static resetDb(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/test/reset',
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
            url: '/api/test/send-test-email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
