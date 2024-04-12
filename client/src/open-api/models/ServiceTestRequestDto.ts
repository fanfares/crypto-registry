/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Network } from './Network';
import type { ServiceType } from './ServiceType';

export type ServiceTestRequestDto = {
    serviceType: ServiceType;
    network: Network;
};
