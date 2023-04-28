/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type VerificationDto = {
    hashedEmail: string;
    receivingAddress: string;
    leaderAddress?: string;
    requestDate: string;
    hash?: string;
    index?: number;
    precedingHash?: string;
    status: string;
};

