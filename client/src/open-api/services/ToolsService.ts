/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BalanceCheckerRequestDto } from '../models/BalanceCheckerRequestDto';
import type { BalanceCheckerResponseDto } from '../models/BalanceCheckerResponseDto';
import type { GenerateAddressFileDto } from '../models/GenerateAddressFileDto';
import type { NetworkDto } from '../models/NetworkDto';
import type { SignatureGeneratorRequestDto } from '../models/SignatureGeneratorRequestDto';
import type { SignatureGeneratorResultDto } from '../models/SignatureGeneratorResultDto';
import type { ViewWalletRequestDto } from '../models/ViewWalletRequestDto';
import type { WalletDto } from '../models/WalletDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ToolsService {

    /**
     * @param requestBody 
     * @returns WalletDto 
     * @throws ApiError
     */
    public static viewWallet(
requestBody: ViewWalletRequestDto,
): CancelablePromise<WalletDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tools/view-wallet',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns BalanceCheckerResponseDto 
     * @throws ApiError
     */
    public static balanceCheck(
requestBody: BalanceCheckerRequestDto,
): CancelablePromise<BalanceCheckerResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tools/balance-check',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

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
            url: '/api/tools/sign-address',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static generateTestAddressFile(
requestBody: GenerateAddressFileDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tools/generate-test-address-file',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns any 
     * @throws ApiError
     */
    public static getTestFundingFile(
requestBody: NetworkDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tools/test-funding',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
