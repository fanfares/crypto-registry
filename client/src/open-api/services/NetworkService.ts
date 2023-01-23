/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BroadcastMessageDto } from '../models/BroadcastMessageDto';
import type { Message } from '../models/Message';
import type { Peer } from '../models/Peer';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NetworkService {

    /**
     * @returns Peer
     * @throws ApiError
     */
    public static getPeers(): CancelablePromise<Array<Peer>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/network/peers',
        });
    }

    /**
     * @returns Message
     * @throws ApiError
     */
    public static getMessages(): CancelablePromise<Array<Message>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/network/messages',
        });
    }

    /**
     * @returns Peer
     * @throws ApiError
     */
    public static join(): CancelablePromise<Array<Peer>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/network/join',
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
            url: '/api/network/message',
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

}
