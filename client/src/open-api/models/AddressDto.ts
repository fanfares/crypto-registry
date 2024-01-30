/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AddressType } from './AddressType';

export type AddressDto = {
    index: number;
    address: string;
    balance: number;
    type: AddressType;
};
