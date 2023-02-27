/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BroadcastMessageDto } from '../models/BroadcastMessageDto';
import type { Message } from '../models/Message';
import type { NetworkStatusDto } from '../models/NetworkStatusDto';
import type { NodeAddress } from '../models/NodeAddress';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NetworkService {

    /**
     * @returns NetworkStatusDto 
     * @throws ApiError
     */
    public static getNetworkStatus(): CancelablePromise<NetworkStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/network',
        });
    }

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

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static broadcastMessage(
requestBody: BroadcastMessageDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/network/broadcast-message',
            body: requestBody,
            mediaType: 'application/json',
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
            url: '/api/network/remove-node',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
