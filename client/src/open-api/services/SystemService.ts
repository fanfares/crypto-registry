/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendTestEmailDto } from '../models/SendTestEmailDto';
import type { SystemStatus } from '../models/SystemStatus';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SystemService {

    /**
     * @returns SystemStatus 
     * @throws ApiError
     */
    public static systemTest(): CancelablePromise<SystemStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/system/test',
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
            url: '/api/system/send-test-email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
