/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovalStatusDto } from '../models/ApprovalStatusDto';
import type { RegistrationApprovalDto } from '../models/RegistrationApprovalDto';
import type { RegistrationStatusDto } from '../models/RegistrationStatusDto';
import type { SendRegistrationRequestDto } from '../models/SendRegistrationRequestDto';
import type { TokenDto } from '../models/TokenDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RegistrationService {

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static sendRegistration(
      requestBody: SendRegistrationRequestDto
    ): CancelablePromise<any> {
      return __request(OpenAPI, {
        method: 'POST',
        url: '/api/registration/send-registration',
        body: requestBody,
        mediaType: 'application/json'
      });
    }

  /**
   * @param requestBody
   * @returns ApprovalStatusDto
   * @throws ApiError
   */
  public static approve(
    requestBody: RegistrationApprovalDto
  ): CancelablePromise<ApprovalStatusDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/registration/approve',
      body: requestBody,
      mediaType: 'application/json'
    });
  }

  /**
   * @param token
   * @returns ApprovalStatusDto
   * @throws ApiError
   */
  public static getApprovalStatus(
    token: string
  ): CancelablePromise<ApprovalStatusDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/registration/approval-status',
      query: {
        'token': token
      }
    });
  }

  /**
   * @param requestBody
   * @returns RegistrationStatusDto
   * @throws ApiError
   */
  public static verifyEmail(
    requestBody: TokenDto
  ): CancelablePromise<RegistrationStatusDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/registration/verify-email',
      body: requestBody,
      mediaType: 'application/json'
    });
  }

  /**
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static initiateApprovals(
    requestBody: TokenDto
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/registration/initiate-approvals',
      body: requestBody,
      mediaType: 'application/json'
    });
  }

  /**
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static getStatus(
    requestBody: TokenDto
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/registration/status',
      body: requestBody,
      mediaType: 'application/json'
    });
  }

}
