/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerHoldingsDto } from '../models/CustomerHoldingsDto';
import type { ExchangeDto } from '../models/ExchangeDto';
import type { RegistrationCheckResult } from '../models/RegistrationCheckResult';

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

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static submitCustodianHoldings(
requestBody: CustomerHoldingsDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/exchange/submit-holdings',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param pk 
     * @returns RegistrationCheckResult 
     * @throws ApiError
     */
    public static checkRegistration(
pk: string,
): CancelablePromise<RegistrationCheckResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exchange/check-registration',
            query: {
                'pk': pk,
            },
        });
    }

    /**
     * @returns any 
     * @throws ApiError
     */
    public static submitCustomersHoldingsCsv(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/exchange/submit-holdings-csv',
        });
    }

}
