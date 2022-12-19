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
    public static getAddressBalance(
        address: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/address-balance/{address}',
            path: {
                'address': address,
            },
        });
    }

    /**
     * @param zpub
     * @returns any
     * @throws ApiError
     */
    public static getWalletBalance(
        zpub: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/wallet-balance/{zpub}',
            path: {
                'zpub': zpub,
            },
        });
    }

    /**
     * @param txid
     * @returns any
     * @throws ApiError
     */
    public static getTransaction(
        txid: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/tx/{txid}',
            path: {
                'txid': txid,
            },
        });
    }

    /**
     * @param address
     * @returns any
     * @throws ApiError
     */
    public static getTransactionsForAddress(
        address: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/address-tx/{address}',
            path: {
                'address': address,
            },
        });
    }

}
