/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IsValid } from '../models/IsValid';
import type { Transaction } from '../models/Transaction';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CryptoService {

    /**
     * @param address
     * @param network
     * @returns number
     * @throws ApiError
     */
    public static getAddressBalance(
        address: string,
        network: string,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/address-balance/{network}/{address}',
            path: {
                'address': address,
                'network': network,
            },
        });
    }

    /**
     * @param zpub
     * @param network
     * @returns number
     * @throws ApiError
     */
    public static getWalletBalance(
        zpub: string,
        network: string,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/wallet-balance/{network}/{zpub}',
            path: {
                'zpub': zpub,
                'network': network,
            },
        });
    }

    /**
     * @param zpub
     * @returns IsValid
     * @throws ApiError
     */
    public static validateZpub(
        zpub: string,
    ): CancelablePromise<IsValid> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/validate-zpub/{zpub}',
            path: {
                'zpub': zpub,
            },
        });
    }

    /**
     * @param txid
     * @param network
     * @returns Transaction
     * @throws ApiError
     */
    public static getTransaction(
        txid: string,
        network: string,
    ): CancelablePromise<Transaction> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/tx/{network}/{txid}',
            path: {
                'txid': txid,
                'network': network,
            },
        });
    }

    /**
     * @param address
     * @param network
     * @returns Transaction
     * @throws ApiError
     */
    public static getTransactionsForAddress(
        address: string,
        network: string,
    ): CancelablePromise<Array<Transaction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crypto/address-tx/{network}/{address}',
            path: {
                'address': address,
                'network': network,
            },
        });
    }

}
