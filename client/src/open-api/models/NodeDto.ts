/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NodeDto = {
    latestVerificationHash: string;
    latestVerificationIndex: number;
    latestSubmissionHash: string;
    latestSubmissionIndex: number;
    nodeName: string;
    address: string;
    unresponsive: boolean;
    blackBalled: boolean;
    publicKey: string;
    ownerEmail: string;
    lastSeen: string;
    isLocal: boolean;
};

