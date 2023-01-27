/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Message = {
    id: string;
    senderName: string;
    senderAddress: string;
    type: string;
    data?: string;
    recipientAddresses: Array<any[]>;
};
