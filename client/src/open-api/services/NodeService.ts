/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NetworkStatusDto } from '../models/NetworkStatusDto';
import type { NodeAddress } from '../models/NodeAddress';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NodeService {

    /**
     * @returns NetworkStatusDto
     * @throws ApiError
     */
    public static getNetworkStatus(): CancelablePromise<NetworkStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/node',
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static removeNode(
        requestBody: NodeAddress,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/node/remove-node',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
