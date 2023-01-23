/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NodeDto } from './NodeDto';

export type NetworkStatusDto = {
    nodeName: string;
    address: string;
    nodes: Array<NodeDto>;
};
