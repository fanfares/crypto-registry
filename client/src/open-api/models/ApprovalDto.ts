/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovalStatus } from './ApprovalStatus';

export type ApprovalDto = {
    institutionName: string;
    email: string;
    status: ApprovalStatus;
};
