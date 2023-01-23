/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TransactionInput } from './TransactionInput';
import type { TransactionOutput } from './TransactionOutput';

export type Transaction = {
    txid: string;
    fee: number;
    blockTime: string;
    inputValue: number;
    inputs: Array<TransactionInput>;
    outputs: Array<TransactionOutput>;
};
