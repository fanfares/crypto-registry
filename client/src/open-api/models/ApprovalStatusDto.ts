/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovalStatus } from './ApprovalStatus';
import type { RegistrationDto } from './RegistrationDto';

export type ApprovalStatusDto = {
    institutionName: string;
    email: string;
    status: ApprovalStatus;
    registration: RegistrationDto;
};
