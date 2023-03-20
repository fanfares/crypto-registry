/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSubmissionCsvDto } from '../models/CreateSubmissionCsvDto';
import type { CreateSubmissionDto } from '../models/CreateSubmissionDto';
import type { PaymentAddressDto } from '../models/PaymentAddressDto';
import type { SubmissionDto } from '../models/SubmissionDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SubmissionService {

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
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static cancelSubmission(
        requestBody: PaymentAddressDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/submission/cancel',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param address
     * @returns SubmissionDto
     * @throws ApiError
     */
    public static getSubmissionStatus(
        address: string,
    ): CancelablePromise<SubmissionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/submission/{address}',
            path: {
                'address': address,
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
