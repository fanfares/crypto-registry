/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SystemConfig } from '../models/SystemConfig';
import type { SystemStatus } from '../models/SystemStatus';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SystemService {

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
