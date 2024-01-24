/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicKeyDto } from '../models/PublicKeyDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserSettingsService {

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static savePublicKey(
        requestBody: PublicKeyDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/user-settings/{save}-public-key',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns PublicKeyDto
     * @throws ApiError
     */
    public static getPublicKey(): CancelablePromise<PublicKeyDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user-settings/public-key',
        });
    }

}
