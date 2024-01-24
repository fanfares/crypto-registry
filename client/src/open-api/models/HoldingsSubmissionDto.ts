/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type HoldingsSubmissionDto = {
    totalHoldings: number;
    exchangeId: string;
    isCurrent: boolean;
    _id: string;
    createdDate: string;
    updatedDate: string;
    holdings: Array<string>;
};
