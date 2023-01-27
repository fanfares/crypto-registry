/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VerificationRequestDto } from '../models/VerificationRequestDto';
import type { VerificationResponseDto } from '../models/VerificationResponseDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class VerificationService {

  /**
   * @param requestBody
   * @returns VerificationResponseDto
   * @throws ApiError
   */
  public static verify(
    requestBody: VerificationRequestDto
  ): CancelablePromise<VerificationResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/verification',
      body: requestBody,
      mediaType: 'application/json'
    });
  }

}
