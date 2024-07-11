/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateExchangeDto } from '../models/CreateExchangeDto';
import type { ExchangeDto } from '../models/ExchangeDto';
import type { UpdateExchangeDto } from '../models/UpdateExchangeDto';

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
     * @param requestBody 
     * @returns ExchangeDto 
     * @throws ApiError
     */
    public static createExchange(
requestBody: CreateExchangeDto,
): CancelablePromise<ExchangeDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/exchange',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id 
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static updateExchange(
id: string,
requestBody: UpdateExchangeDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/exchange/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
