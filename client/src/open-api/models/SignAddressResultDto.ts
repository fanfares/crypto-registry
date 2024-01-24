/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';

export type SignAddressResultDto = {
    address: string;
    signature: string;
    derivationPath: string;
    network: Network;
};

