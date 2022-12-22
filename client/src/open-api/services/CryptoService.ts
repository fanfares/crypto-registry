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
   * @returns number
   * @throws ApiError
   */
  public static getAddressBalance(
    address: string
  ): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/crypto/address-balance/{address}',
      path: {
        'address': address
      }
    });
  }

  /**
   * @param zpub
   * @returns number
   * @throws ApiError
   */
  public static getWalletBalance(
    zpub: string
  ): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/crypto/wallet-balance/{zpub}',
      path: {
        'zpub': zpub
      }
    });
  }

  /**
   * @param zpub
   * @returns IsValid
   * @throws ApiError
   */
  public static validateZpub(
    zpub: string
  ): CancelablePromise<IsValid> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/crypto/validate-zpub/{zpub}',
      path: {
        'zpub': zpub
      }
    });
  }

  /**
   * @param txid
   * @returns Transaction
   * @throws ApiError
   */
  public static getTransaction(
    txid: string
  ): CancelablePromise<Transaction> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/crypto/tx/{txid}',
      path: {
        'txid': txid
      }
    });
  }

  /**
   * @param address
   * @returns Transaction
   * @throws ApiError
   */
  public static getTransactionsForAddress(
    address: string
  ): CancelablePromise<Array<Transaction>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/crypto/address-tx/{address}',
      path: {
        'address': address
      }
    });
  }

}
