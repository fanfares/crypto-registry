/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserDto } from '../models/CreateUserDto';
import type { ResourceIdDto } from '../models/ResourceIdDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { UserDto } from '../models/UserDto';

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
requestBody: CreateUserDto,
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
requestBody: UpdateUserDto,
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
