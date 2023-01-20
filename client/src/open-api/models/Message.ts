/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MessagePayload } from './MessagePayload';

export type Message = {
    payload: MessagePayload;
    recipientAddresses: Array<any[]>;
    id: string;
};

