/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AddressDto } from './AddressDto';
import type { Network } from './Network';

export type WalletDto = {
    derivationPath: string;
    network: Network;
    scriptType: string;
    typeDescription: string;
    balance: number;
    addresses: Array<AddressDto>;
};
