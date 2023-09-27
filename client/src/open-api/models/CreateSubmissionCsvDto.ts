/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';

export type CreateSubmissionCsvDto = {
    exchangeZpubs: Array<any[]>;
    exchangeName: string;
    network: Network;
};
