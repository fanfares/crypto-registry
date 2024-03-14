/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type HoldingsSubmissionDto = {
    totalHoldings: number;
    exchangeId: string;
    exchangeUid?: string;
    isCurrent: boolean;
    _id: string;
    createdDate: string;
    updatedDate: string;
    holdings: Array<string>;
};
