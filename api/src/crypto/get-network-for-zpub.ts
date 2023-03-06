import { BadRequestException } from '@nestjs/common';
import { Network } from '@bcr/types';

export const getNetworkForZpub = (zpub: string): Network => {
  if (zpub.startsWith('zpub')) {
    return Network.mainnet;
  } else if (zpub.startsWith('vpub')) {
    return Network.testnet;
  } else {
    throw new BadRequestException('Extended Public key must start with zpub or vpub');
  }
};
