/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendTestEmailDto } from '../models/SendTestEmailDto';
import type { SystemConfig } from '../models/SystemConfig';
import type { SystemStatus } from '../models/SystemStatus';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SystemService {

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

    /**
     * @returns SystemConfig 
     * @throws ApiError
     */
    public static getSystemConfig(): CancelablePromise<SystemConfig> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/system/config',
        });
    }

    /**
     * @returns SystemStatus 
     * @throws ApiError
     */
    public static systemTest(): CancelablePromise<SystemStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/system',
        });
    }

}
