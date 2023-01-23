/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BroadcastMessageDto } from '../models/BroadcastMessageDto';
import type { Message } from '../models/Message';
import type { MessageDto } from '../models/MessageDto';
import type { Node } from '../models/Node';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NetworkService {

    /**
     * @returns Node
     * @throws ApiError
     */
    public static getNodes(): CancelablePromise<Array<Node>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/network/nodes'
        });
    }

    /**
     * @returns MessageDto
     * @throws ApiError
     */
    public static getMessages(): CancelablePromise<Array<MessageDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/network/messages'
        });
    }

    /**
     * @returns Node
     * @throws ApiError
     */
    public static join(): CancelablePromise<Array<Node>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/network/request-to-join'
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static receiveMessage(
      requestBody: Message
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/network/receive-message',
            body: requestBody,
            mediaType: 'application/json'
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static broadcastMessage(
      requestBody: BroadcastMessageDto
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/network/broadcast-message',
            body: requestBody,
            mediaType: 'application/json'
        });
    }

}
