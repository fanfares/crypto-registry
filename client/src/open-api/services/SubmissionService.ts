/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubmissionDto } from '../models/SubmissionDto';
import type { SubmissionStatusDto } from '../models/SubmissionStatusDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SubmissionService {

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static submitHoldings(
requestBody: SubmissionDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/submission/submit',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param address 
     * @returns SubmissionStatusDto 
     * @throws ApiError
     */
    public static getSubmissionStatus(
address: string,
): CancelablePromise<SubmissionStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/submission/status/{address}',
            path: {
                'address': address,
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
            url: '/api/submission/submit-csv',
        });
    }

}
