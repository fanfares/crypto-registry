/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NodeDto = {
    latestVerificationId: string;
    latestSubmissionId: string;
    mainnetRegistryWalletAddressCount: number;
    testnetRegistryWalletAddressCount: number;
    leaderVote: string;
    isStarting: boolean;
    nodeName: string;
    address: string;
    unresponsive: boolean;
    blackBalled: boolean;
    publicKey: string;
    ownerEmail: string;
    lastSeen: string;
    isLeader: boolean;
    synchronisingSourceNode?: string;
    isLocal: boolean;
};
