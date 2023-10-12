/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NodeDto = {
    address: string;
    latestVerificationId: string;
    latestSubmissionId: string;
    leaderVote: string;
    nodeName: string;
    unresponsive: boolean;
    blackBalled: boolean;
    publicKey: string;
    ownerEmail: string;
    lastSeen: string;
    isLeader: boolean;
    synchronisingSourceNode?: string;
    isLocal: boolean;
};
