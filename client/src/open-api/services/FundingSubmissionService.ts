/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateFundingSubmissionCsvDto } from '../models/CreateFundingSubmissionCsvDto';
import type { CreateFundingSubmissionDto } from '../models/CreateFundingSubmissionDto';
import type { FundingSubmissionDto } from '../models/FundingSubmissionDto';
import type { SubmissionId } from '../models/SubmissionId';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FundingSubmissionService {

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
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static cancelSubmission(
        requestBody: SubmissionId,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/funding-submission/cancel',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static getSigningMessage(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/funding-submission/signing-message',
        });
    }

    /**
     * @returns FundingSubmissionDto
     * @throws ApiError
     */
    public static getCurrentSubmission(): CancelablePromise<FundingSubmissionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/funding-submission/current',
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
     * @returns FundingSubmissionDto
     * @throws ApiError
     */
    public static submitCsv(
        requestBody: CreateFundingSubmissionCsvDto,
    ): CancelablePromise<FundingSubmissionDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/funding-submission/submit-csv',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
