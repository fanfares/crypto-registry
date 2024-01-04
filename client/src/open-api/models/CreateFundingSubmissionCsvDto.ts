/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';

export type CreateFundingSubmissionCsvDto = {
    exchangeId: string;
    network: Network;
    signingMessage: string;
};
