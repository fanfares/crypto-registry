/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Message } from '../models/Message';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NetworkService {

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static receiveMessage(
        requestBody: Message,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/network/receive-message',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
