/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ServiceTestResultDto } from './ServiceTestResultDto';

export type ServiceTestResultsDto = {
    bitcoinCoreMainnet: ServiceTestResultDto;
    bitcoinCoreTestnet: ServiceTestResultDto;
    electrumxMainnet: ServiceTestResultDto;
    electrumxTestnet: ServiceTestResultDto;
};
