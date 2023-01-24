/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MessageDto = {
    id: string;
    sender: string;
    type: string;
    data?: string;
    recipientAddresses: Array<any[]>;
    isSender: boolean;
};
