/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type VerificationDto = {
    hashedEmail: string;
    receivingAddress: string;
    leaderAddress: string;
    sentEmail: boolean;
    requestDate: string;
    hash: string;
    index: number;
    precedingHash: string;
    confirmedBySender?: boolean;
};

