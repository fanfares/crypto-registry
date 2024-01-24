/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResourceIdDto } from '../models/ResourceIdDto';
import type { UserCreateDto } from '../models/UserCreateDto';
import type { UserDto } from '../models/UserDto';
import type { UserUpdateDto } from '../models/UserUpdateDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {

    /**
     * @returns UserDto
     * @throws ApiError
     */
    public static getUsers(): CancelablePromise<Array<UserDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user',
        });
    }

    /**
     * @param requestBody
     * @returns ResourceIdDto
     * @throws ApiError
     */
    public static createUser(
        requestBody: UserCreateDto,
    ): CancelablePromise<ResourceIdDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param userId
     * @returns UserDto
     * @throws ApiError
     */
    public static getUser(
        userId: string,
    ): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }

    /**
     * @param userId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static updateUser(
        userId: string,
        requestBody: UserUpdateDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/user/{userId}',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static deleteUser(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }

}
