/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export enum SubmissionStatus {
    NEW = 'new',
    RETRIEVING_WALLET_BALANCE = 'retrieving-wallet-balance',
    INSUFFICIENT_FUNDS = 'insufficient-funds',
    CANCELLED = 'cancelled',
    WAITING_FOR_CONFIRMATION = 'waiting-for-confirmation',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
    PROCESSING_FAILED = 'processing-failed',
    INVALID_SIGNATURE = 'invalid-signature',
}
