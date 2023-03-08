/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovalDto } from './ApprovalDto';
import type { RegistrationDto } from './RegistrationDto';

export type RegistrationStatusDto = {
    registration: RegistrationDto;
    approvals: Array<ApprovalDto>;
};

