/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VerifyRequestDto } from '../models/VerifyRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustomerService {

  /**
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static verifyHoldings(
    requestBody: VerifyRequestDto
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/customer/verify',
      body: requestBody,
      mediaType: 'application/json'
    });
  }

}
