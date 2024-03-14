/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ResetService {

    /**
     * @returns any 
     * @throws ApiError
     */
    public static reset(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/reset',
        });
    }

}
