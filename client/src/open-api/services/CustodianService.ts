/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerHoldingsDto } from '../models/CustomerHoldingsDto';
import type { RegistrationCheckResult } from '../models/RegistrationCheckResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustodianService {

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
            url: '/api/custodian/check-registration',
            query: {
                'pk': pk,
            },
        });
    }

}
