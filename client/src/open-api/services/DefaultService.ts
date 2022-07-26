/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustodianRecord } from '../models/CustodianRecord';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * @returns any
     * @throws ApiError
     */
    public static getHello(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api'
        });
    }

    /**
     * @param publicKey
     * @returns any
     * @throws ApiError
     */
    public static getBalance(
      publicKey: string
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/balance/{publicKey}',
            path: {
                'publicKey': publicKey
            }
        });
    }

    /**
     * @returns CustodianRecord
     * @throws ApiError
     */
    public static getAllCustodians(): CancelablePromise<Array<CustodianRecord>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/custodian'
        });
    }

}
