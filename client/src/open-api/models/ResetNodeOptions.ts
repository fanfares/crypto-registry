/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ResetNodeOptions = {
    resetChains?: boolean;
    resetAll?: boolean;
    resetNetwork?: boolean;
    resetWallet?: boolean;
    resetMockWallet?: boolean;
    emitResetNetwork?: boolean;
    autoStart?: boolean;
    nodes?: Array<string>;
};
