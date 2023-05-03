/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NodeDto = {
    latestVerificationHash: string;
    latestVerificationIndex: number;
    latestSubmissionHash: string;
    latestSubmissionIndex: number;
    mainnetRegistryWalletAddressCount: number;
    testnetRegistryWalletAddressCount: number;
    leaderVote: string;
    nodeName: string;
    address: string;
    unresponsive: boolean;
    blackBalled: boolean;
    publicKey: string;
    ownerEmail: string;
    lastSeen: string;
    isLeader: boolean;
    isStarting: boolean;
    isSynchronising?: boolean;
    synchronisingSourceNode?: string;
    isLocal: boolean;
};

