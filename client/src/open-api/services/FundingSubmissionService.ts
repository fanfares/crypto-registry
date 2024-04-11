/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateFundingSubmissionCsvDto } from '../models/CreateFundingSubmissionCsvDto';
import type { CreateFundingSubmissionDto } from '../models/CreateFundingSubmissionDto';
import type { FundingSubmissionDto } from '../models/FundingSubmissionDto';
import type { FundingSubmissionStatusDto } from '../models/FundingSubmissionStatusDto';

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
     * @returns FundingSubmissionDto 
     * @throws ApiError
     */
    public static getSubmissions(): CancelablePromise<Array<FundingSubmissionDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/funding-submission',
        });
    }

    /**
     * @param requestBody 
     * @returns FundingSubmissionDto 
     * @throws ApiError
     */
    public static createSubmission(
requestBody: CreateFundingSubmissionDto,
): CancelablePromise<FundingSubmissionDto> {
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
     * @param submissionId 
     * @returns FundingSubmissionDto 
     * @throws ApiError
     */
    public static getSubmission(
submissionId: string,
): CancelablePromise<FundingSubmissionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/funding-submission/{submissionId}',
            path: {
                'submissionId': submissionId,
            },
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

}
