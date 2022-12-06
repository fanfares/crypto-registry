/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CryptoService {

    /**
     * @param address 
     * @returns any 
     * @throws ApiError
     */
    public static getBalance(
address: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/balance/{address}',
            path: {
                'address': address,
            },
        });
    }

}
