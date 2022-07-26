/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BlockChainService {

  /**
   * @param publicKey
   * @returns any
   * @throws ApiError
   */
  public static getBalance(
    publicKey: string
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/block-chain/get-balance/{publicKey}',
      path: {
        'publicKey': publicKey
      }
    });
  }

}
