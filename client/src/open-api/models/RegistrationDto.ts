/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovalStatus } from './ApprovalStatus';

export type RegistrationDto = {
    email: string;
    nodeName: string;
    nodeAddress: string;
    institutionName: string;
    status: ApprovalStatus;
};
