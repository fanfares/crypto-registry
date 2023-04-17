/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export enum SubmissionStatus {
    RETRIEVING_WALLET_BALANCE = 'retrieving-wallet-balance',
    INSUFFICIENT_FUNDS = 'insufficient-funds',
    WAITING_FOR_PAYMENT = 'waiting-for-payment',
    CANCELLED = 'cancelled',
    SENDER_MISMATCH = 'sender-mismatch',
    WAITING_FOR_CONFIRMATION = 'waiting-for-confirmation',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}
