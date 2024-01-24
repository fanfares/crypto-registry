/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtendedKeyValidationResult } from '../models/ExtendedKeyValidationResult';
import type { SignatureGeneratorRequestDto } from '../models/SignatureGeneratorRequestDto';
import type { SignatureGeneratorResultDto } from '../models/SignatureGeneratorResultDto';
import type { Transaction } from '../models/Transaction';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BitcoinService {

    /**
     * @param requestBody 
     * @returns SignatureGeneratorResultDto 
     * @throws ApiError
     */
    public static signAddress(
requestBody: SignatureGeneratorRequestDto,
): CancelablePromise<SignatureGeneratorResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/bitcoin/sign-address',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

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
            url: '/api/bitcoin/address-balance/{network}/{address}',
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
            url: '/api/bitcoin/wallet-balance/{network}/{zpub}',
            path: {
                'zpub': zpub,
                'network': network,
            },
        });
    }

    /**
     * @param zpub 
     * @returns ExtendedKeyValidationResult 
     * @throws ApiError
     */
    public static validateExtendedKey(
zpub: string,
): CancelablePromise<ExtendedKeyValidationResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bitcoin/validate-extended-key/{zpub}',
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
            url: '/api/bitcoin/tx/{network}/{txid}',
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
            url: '/api/bitcoin/address-tx/{network}/{address}',
            path: {
                'address': address,
                'network': network,
            },
        });
    }

}
