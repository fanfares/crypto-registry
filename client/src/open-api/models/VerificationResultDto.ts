/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { VerifiedHoldingsDto } from './VerifiedHoldingsDto';

export type VerificationResultDto = {
    verificationId: string;
    verifiedHoldings: Array<VerifiedHoldingsDto>;
};
