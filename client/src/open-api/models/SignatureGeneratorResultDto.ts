/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';

export type SignatureGeneratorResultDto = {
    index: number;
    change: boolean;
    signature: string;
    derivationPath: string;
    network: Network;
    balance: number;
};
