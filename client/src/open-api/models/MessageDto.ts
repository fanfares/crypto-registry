/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MessageDto = {
    sender: string;
    type: string;
    data?: string;
    recipientAddresses: Array<any[]>;
    id: string;
    isSender: boolean;
};
