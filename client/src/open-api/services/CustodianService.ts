/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustodianRecord } from '../models/CustodianRecord';
import type { CustomerHoldingsDto } from '../models/CustomerHoldingsDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustodianService {

    /**
     * @returns CustodianRecord 
     * @throws ApiError
     */
    public static getAllCustodians(): CancelablePromise<Array<CustodianRecord>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/custodian',
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
            url: '/api/custodian/submit-holdings',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
