/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VerificationDto } from '../models/VerificationDto';
import type { VerificationRequestDto } from '../models/VerificationRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class VerificationService {

    /**
     * @param requestBody 
     * @returns VerificationDto 
     * @throws ApiError
     */
    public static verify(
requestBody: VerificationRequestDto,
): CancelablePromise<VerificationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/verification',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param email 
     * @returns any 
     * @throws ApiError
     */
    public static getVerificationsByEmail(
email: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/verification',
            query: {
                'email': email,
            },
        });
    }

}
