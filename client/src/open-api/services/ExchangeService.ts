/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExchangeDto } from '../models/ExchangeDto';

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
            url: '/api/exchange',
        });
    }

}
