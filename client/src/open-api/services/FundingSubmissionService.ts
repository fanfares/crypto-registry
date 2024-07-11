/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateFundingSubmissionCsvDto } from '../models/CreateFundingSubmissionCsvDto';
import type { CreateFundingSubmissionDto } from '../models/CreateFundingSubmissionDto';
import type { FundingSubmissionStatusDto } from '../models/FundingSubmissionStatusDto';
import type { RefreshBalancesRequestDto } from '../models/RefreshBalancesRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FundingSubmissionService {

    /**
     * @returns any 
     * @throws ApiError
     */
    public static sse(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/funding-submission/sse',
        });
    }

    /**
     * @returns FundingSubmissionStatusDto 
     * @throws ApiError
     */
    public static getFundingStatus(): CancelablePromise<FundingSubmissionStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/funding-submission/status',
        });
    }

    /**
     * @returns any 
     * @throws ApiError
     */
    public static downloadExampleFile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/funding-submission/download-example-file',
        });
    }

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static createSubmission(
requestBody: CreateFundingSubmissionDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/funding-submission',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any 
     * @throws ApiError
     */
    public static cancelPending(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/funding-submission/cancel-pending',
        });
    }

    /**
     * @param requestBody 
     * @returns FundingSubmissionStatusDto 
     * @throws ApiError
     */
    public static submitCsv(
requestBody: CreateFundingSubmissionCsvDto,
): CancelablePromise<FundingSubmissionStatusDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/funding-submission/submit-csv',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static refreshBalances(
requestBody: RefreshBalancesRequestDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/funding-submission/refresh-balances',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
