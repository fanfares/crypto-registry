/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

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

}
