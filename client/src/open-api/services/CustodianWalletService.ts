/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustodianWalletRecord } from '../models/CustodianWalletRecord';
import type { RegisterCustodianWalletDto } from '../models/RegisterCustodianWalletDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustodianWalletService {

    /**
     * @returns CustodianWalletRecord
     * @throws ApiError
     */
    public static getAllCustodians(): CancelablePromise<Array<CustodianWalletRecord>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/custodian-wallet'
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static registerCustodianWallet(
      requestBody: RegisterCustodianWalletDto
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/custodian-wallet',
            body: requestBody,
            mediaType: 'application/json'
        });
    }

}
