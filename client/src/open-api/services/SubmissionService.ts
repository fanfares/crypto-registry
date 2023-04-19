/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChainStatus } from '../models/ChainStatus';
import type { CreateSubmissionCsvDto } from '../models/CreateSubmissionCsvDto';
import type { CreateSubmissionDto } from '../models/CreateSubmissionDto';
import type { SubmissionDto } from '../models/SubmissionDto';
import type { SubmissionId } from '../models/SubmissionId';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SubmissionService {

    /**
     * @returns ChainStatus
     * @throws ApiError
     */
    public static verifyChain(): CancelablePromise<ChainStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/submission/verify-chain',
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static createSubmission(
        requestBody: CreateSubmissionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/submission',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param paymentAddress
     * @returns SubmissionDto
     * @throws ApiError
     */
    public static getSubmissionStatusByAddress(
        paymentAddress: string,
    ): CancelablePromise<SubmissionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/submission',
            query: {
                'paymentAddress': paymentAddress,
            },
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
            url: '/api/submission/cancel',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param submissionId
     * @returns SubmissionDto
     * @throws ApiError
     */
    public static getSubmission(
        submissionId: string,
    ): CancelablePromise<SubmissionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/submission/{submissionId}',
            path: {
                'submissionId': submissionId,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static submitCustomersHoldingsCsv(
        requestBody: CreateSubmissionCsvDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/submission/submit-csv',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
