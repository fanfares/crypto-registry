/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export enum SubmissionStatus {
    NEW = 'new',
    RETRIEVING_WALLET_BALANCE = 'retrieving-wallet-balance',
    INSUFFICIENT_FUNDS = 'insufficient-funds',
    WAITING_FOR_PAYMENT = 'waiting-for-payment',
    WAITING_FOR_PAYMENT_ADDRESS = 'waiting-for-payment-address',
    CANCELLED = 'cancelled',
    SENDER_MISMATCH = 'sender-mismatch',
    WAITING_FOR_CONFIRMATION = 'waiting-for-confirmation',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}
