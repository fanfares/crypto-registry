/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExchangeDto } from '../models/ExchangeDto';
import type { UserDto } from '../models/UserDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ExchangeService {

    /**
     * @returns ExchangeDto 
     * @throws ApiError
     */
    public static getAllExchanges(): CancelablePromise<Array<ExchangeDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exchange/all',
        });
    }

    /**
     * @returns UserDto 
     * @throws ApiError
     */
    public static getExchangeUsers(): CancelablePromise<Array<UserDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exchange/users',
        });
    }

    /**
     * @returns ExchangeDto 
     * @throws ApiError
     */
    public static getUserExchange(): CancelablePromise<ExchangeDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exchange',
        });
    }

    /**
     * @returns any 
     * @throws ApiError
     */
    public static updateStatus(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/exchange/update-status',
        });
    }

}
