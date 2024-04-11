import { ElectrumTcpClient } from './electrum-tcp-client';
import { ElectrumClientInterface } from './electrum-client-interface';
import { ElectrumWsClient } from './electrum-ws-client';
import { BadRequestException } from '@nestjs/common';
import { Network } from '@bcr/types';

export const electrumxClientFactory = {
  create: (
    url: string,
    network: Network
  ): ElectrumClientInterface => {
    const urlObject = new URL(url);
    const protocol = urlObject.protocol;

    if (protocol === 'ws:') {
      return new ElectrumWsClient(url);
    } else if (protocol === 'ssl:') {
      const certPath = `.certs/electrumx-${network}.crt`;
      return new ElectrumTcpClient(url, certPath);
    } else {
      throw new BadRequestException('Invalid protocol for ElectrumX ' + protocol);
    }
  }
};
