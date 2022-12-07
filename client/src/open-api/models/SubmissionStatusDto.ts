/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubmissionStatus } from './SubmissionStatus';

export type SubmissionStatusDto = {
    paymentAddress: string;
    paymentAmount: number;
    exchangeName: string;
    submissionStatus: SubmissionStatus;
};

