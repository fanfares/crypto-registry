/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UserDto = {
    email: string;
    passwordHash?: string;
    isVerified: boolean;
    lastSignIn?: string;
    isSystemAdmin: boolean;
    exchangeId?: string;
    publicKey?: string;
    _id: string;
    createdDate: string;
    updatedDate: string;
    exchangeName: string;
};
