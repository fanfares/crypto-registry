/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateHoldingsSubmissionDto } from '../models/CreateHoldingsSubmissionDto';
import type { HoldingsSubmissionDto } from '../models/HoldingsSubmissionDto';
import type { SubmissionId } from '../models/SubmissionId';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HoldingsSubmissionService {

    /**
     * @returns any
     * @throws ApiError
     */
    public static downloadExampleFile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/holdings-submission/download-example-file',
        });
    }

    /**
     * @returns HoldingsSubmissionDto
     * @throws ApiError
     */
    public static getSubmissions(): CancelablePromise<Array<HoldingsSubmissionDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/holdings-submission',
        });
    }

    /**
     * @param requestBody
     * @returns HoldingsSubmissionDto
     * @throws ApiError
     */
    public static createSubmission(
        requestBody: CreateHoldingsSubmissionDto,
    ): CancelablePromise<HoldingsSubmissionDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/holdings-submission',
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
            url: '/api/holdings-submission/cancel',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns HoldingsSubmissionDto
     * @throws ApiError
     */
    public static getCurrentSubmission(): CancelablePromise<HoldingsSubmissionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/holdings-submission/current',
        });
    }

    /**
     * @param submissionId
     * @returns HoldingsSubmissionDto
     * @throws ApiError
     */
    public static getSubmission(
        submissionId: string,
    ): CancelablePromise<HoldingsSubmissionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/holdings-submission/{submissionId}',
            path: {
                'submissionId': submissionId,
            },
        });
    }

    /**
     * @returns HoldingsSubmissionDto
     * @throws ApiError
     */
    public static submitCustomersHoldingsCsv(): CancelablePromise<HoldingsSubmissionDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/holdings-submission/submit-csv',
        });
    }

}
