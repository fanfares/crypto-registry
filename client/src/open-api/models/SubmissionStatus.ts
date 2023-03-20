/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export enum SubmissionStatus {
    WAITING_FOR_PAYMENT = 'waiting-for-payment',
    CANCELLED = 'cancelled',
    INSUFFICIENT_FUNDS = 'insufficient-funds',
    SENDER_MISMATCH = 'sender-mismatch',
    WAITING_FOR_CONFIRMATION = 'waiting-for-confirmation',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}
